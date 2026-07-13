import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { success } from "../../utils/apiResponse";
import { addFavorite, removeFavorite, listUserFavorites } from "./favorite.service";

export const add = asyncHandler(async (req: Request, res: Response) => {
  return success(res, await addFavorite(req.user!.userId, req.params.bookId), "Added to favorites", 201);
});
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await removeFavorite(req.user!.userId, req.params.bookId);
  return success(res, null, "Removed from favorites");
});
export const listMine = asyncHandler(async (req: Request, res: Response) => {
  return success(res, await listUserFavorites(req.user!.userId));
});