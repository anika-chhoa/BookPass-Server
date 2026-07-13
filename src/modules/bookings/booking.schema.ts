import { z } from "zod";
export const createBookingSchema = z.object({ bookId: z.string().min(1) });