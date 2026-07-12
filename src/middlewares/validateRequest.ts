// import { Request, Response, NextFunction } from "express";
// import { AnyZodObject } from "zod";

// export function validateRequest(schema: AnyZodObject) {
//   return (req: Request, _res: Response, next: NextFunction) => {
//     const parsed = schema.parse({
//       body: req.body,
//       query: req.query,
//       params: req.params,
//     });

//     if (parsed.body) req.body = parsed.body;
//     if (parsed.query) req.query = parsed.query;
//     if (parsed.params) req.params = parsed.params;

//     next();
//   };
// }