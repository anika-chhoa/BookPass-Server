import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { success } from "../../utils/apiResponse";
import { getDashboardStats } from "./dashboard.service";

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  return success(res, await getDashboardStats(req.user!.userId));
});