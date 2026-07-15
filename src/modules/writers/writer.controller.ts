import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { success } from "../../utils/apiResponse";
import { createWriterSchema } from "./writer.schema";
import { createWriter, listWriters } from "./writer.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, photoUrl } = createWriterSchema.parse(req.body);
  const writer = await createWriter(name, photoUrl);
  return success(res, writer, "Writer created", 201);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  return success(res, await listWriters(limit));
});