import type { ObjectId } from "mongodb";
import { collection } from "../../db/collections";

export interface BookingDoc {
  _id?: ObjectId;
  userId: ObjectId;
  bookId: ObjectId;
  bookTitle: string;
  bookCoverUrl: string;
  bookedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: "active" | "returned";
}

export const bookingsCollection = () => collection<BookingDoc>("bookings");