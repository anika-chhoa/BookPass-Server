import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../config/jwt";
import { failure } from "../utils/apiResponse";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return failure(res, "Authentication required", 401);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return failure(res, "Invalid or expired token", 401);
  }
}