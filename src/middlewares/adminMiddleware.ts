import type { NextFunction, Request, Response } from "express";
import { failure } from "../utils/apiResponse";

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") return failure(res, "Admin access required", 403);
  next();
}