import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { success } from "../../utils/apiResponse";
import { getPublicStats } from "./stats.service";

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  return success(res, await getPublicStats());
});