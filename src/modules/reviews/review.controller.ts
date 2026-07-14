import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { success } from "../../utils/apiResponse";
import { createReviewSchema } from "./review.schema";
import { createReview, listBookReviews, listFeaturedReviews } from "./review.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = createReviewSchema.parse(req.body);
  const review = await createReview(req.user!.userId, req.params.bookId, rating, comment);
  return success(res, review, "Review posted", 201);
});

export const listForBook = asyncHandler(async (req: Request, res: Response) => {
  return success(res, await listBookReviews(req.params.bookId));
});

export const featured = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 4, 10);
  return success(res, await listFeaturedReviews(limit));
});