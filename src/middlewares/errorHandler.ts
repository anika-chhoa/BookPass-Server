import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { failure } from "../utils/apiResponse";

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return failure(res, "Validation failed", 422, err.flatten());
  }

  if (err instanceof AppError) {
    return failure(res, err.message, err.statusCode);
  }

  console.error("Unhandled error:", err);
  return failure(res, "Internal server error", 500);
}

export function notFoundHandler(req: Request, res: Response) {
  return failure(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}
