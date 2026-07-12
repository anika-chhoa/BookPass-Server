import type { Response } from "express";

export function success<T>(res: Response, data: T, message = "OK", statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function failure(res: Response, message = "Something went wrong", statusCode = 400, errors?: unknown) {
  return res.status(statusCode).json({ success: false, message, errors });
}



// import { Response } from "express";

// export function sendSuccess<T>(
//   res: Response,
//   data: T,
//   message = "Success",
//   statusCode = 200
// ) {
//   return res.status(statusCode).json({
//     success: true,
//     message,
//     data,
//   });
// }

// export function sendError(
//   res: Response,
//   message = "Something went wrong",
//   statusCode = 500,
//   errors?: unknown
// ) {
//   return res.status(statusCode).json({
//     success: false,
//     message,
//     errors: errors ?? null,
//   });
// }