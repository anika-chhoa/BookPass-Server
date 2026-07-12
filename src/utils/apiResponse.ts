import type { Response } from "express";

export function success<T>(res: Response, data: T, message = "OK", statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function failure(res: Response, message = "Something went wrong", statusCode = 400, errors?: unknown) {
  return res.status(statusCode).json({ success: false, message, errors });
}
