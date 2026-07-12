import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { asyncHandler } from "../../utils/asyncHandler";
import { success } from "../../utils/apiResponse";
import { registerSchema, loginSchema } from "./auth.schema";
import { registerUser, loginUser, refreshSession } from "./auth.service";
import { usersCollection } from "./auth.types";

const REFRESH_COOKIE = "refreshToken";
const cookieOpts = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" };

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = registerSchema.parse(req.body);
  const { accessToken, refreshToken, user } = await registerUser(name, email, password);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
  return success(res, { accessToken, user }, "Account created", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const { accessToken, refreshToken, user } = await loginUser(email, password);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
  return success(res, { accessToken, user }, "Logged in");
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) return success(res, null, "No session", 401);
  const { accessToken, refreshToken, user } = await refreshSession(token);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
  return success(res, { accessToken, user }, "Session refreshed");
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE);
  return success(res, null, "Logged out");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = await usersCollection().findOne({ _id: new ObjectId(userId) });
  if (!user) return success(res, null, "Not found", 404);
  return success(res, { id: user._id!.toString(), name: user.name, email: user.email, role: user.role, plan: user.plan });
});