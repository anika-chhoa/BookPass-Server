import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { success } from "../../utils/apiResponse";
import { paginationQuerySchema, updateUserRoleSchema } from "./admin.schema";
import { listAllUsers, updateUserRole, listAllBookings, listAllPayments, getAdminStats } from "./admin.service";

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginationQuerySchema.parse(req.query);
  return success(res, await listAllUsers(page, limit));
});

export const patchUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = updateUserRoleSchema.parse(req.body);
  const user = await updateUserRole(req.user!.userId, req.params.id, role);
  return success(res, user, "Role updated");
});

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginationQuerySchema.parse(req.query);
  return success(res, await listAllBookings(page, limit));
});

export const getPayments = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginationQuerySchema.parse(req.query);
  return success(res, await listAllPayments(page, limit));
});

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  return success(res, await getAdminStats());
});