// import type { NextFunction, Request, Response } from "express";

// type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;


// export function asyncHandler(fn: AsyncFn) {
//   return (req: Request, res: Response, next: NextFunction) => {
//     Promise.resolve(fn(req, res, next)).catch(next);
//   };
// }

import { Request, Response, NextFunction, RequestHandler } from "express";

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
