import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { success } from "../../utils/apiResponse";
import { createBookingSchema } from "./booking.schema";
import { createBooking, listUserBookings, returnBooking } from "./booking.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = createBookingSchema.parse(req.body);
  const booking = await createBooking(req.user!.userId, bookId);
  return success(res, booking, "Book booked successfully", 201);
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  return success(res, await listUserBookings(req.user!.userId));
});

export const returnOne = asyncHandler(async (req: Request, res: Response) => {
  await returnBooking(req.user!.userId, req.params.id);
  return success(res, null, "Book returned successfully");
});