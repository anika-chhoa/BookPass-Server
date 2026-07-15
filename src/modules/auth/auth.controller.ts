import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { success } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  googleLoginSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "./auth.schema";
import {
  loginUser,
  loginWithGoogle,
  refreshSession,
  registerUser,
  toPublicUser,
  updateUserProfile,
} from "./auth.service";
import { usersCollection } from "./auth.types";
import { env } from "../../config/env";

const REFRESH_COOKIE = "refreshToken";
const isSecureContext = env.CLIENT_URL.startsWith("https://");
const cookieOpts = {
  httpOnly: true,
  sameSite: isSecureContext ? ("none" as const) : ("lax" as const),
  secure: isSecureContext,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, avatarUrl } = registerSchema.parse(req.body);
  const { accessToken, refreshToken, user } = await registerUser(
    name,
    email,
    password,
    avatarUrl,
  );
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
  return success(res, { accessToken, user }, "Account created", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const { accessToken, refreshToken, user } = await loginUser(email, password);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
  return success(res, { accessToken, user }, "Logged in");
});

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = googleLoginSchema.parse(req.body);
  const { accessToken, refreshToken, user } = await loginWithGoogle(idToken);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
  return success(res, { accessToken, user }, "Logged in with Google");
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
  const user = await usersCollection().findOne({
    _id: new ObjectId(req.user!.userId),
  });
  if (!user) return success(res, null, "Not found", 404);
  return success(res, toPublicUser(user));
});

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const updates = updateProfileSchema.parse(req.body);
    const user = await updateUserProfile(req.user!.userId, updates);
    return success(res, user, "Profile updated");
  },
);
