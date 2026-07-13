import { ObjectId } from "mongodb";
import { bookingsCollection, type BookingDoc } from "./booking.types";
import { booksCollection } from "../books/book.types";
import { usersCollection } from "../auth/auth.types";
import { AppError } from "../../middlewares/errorHandler";
import { PLANS, getPeriodStart } from "../../config/plans";

function toPublicBooking(b: BookingDoc) {
  const { _id, userId, bookId, ...rest } = b;
  return { id: _id!.toString(), bookId: bookId.toString(), ...rest };
}

export async function createBooking(userId: string, bookId: string) {
  if (!ObjectId.isValid(bookId)) throw new AppError("Invalid book id", 400);

  const user = await usersCollection().findOne({ _id: new ObjectId(userId) });
  if (!user) throw new AppError("User not found", 404);

  const plan = PLANS[user.plan];
  const periodStart = getPeriodStart(plan.periodLabel);
  const countThisPeriod = await bookingsCollection().countDocuments({
    userId: new ObjectId(userId),
    bookedAt: { $gte: periodStart },
  });
  if (countThisPeriod >= plan.booksPerPeriod) {
    throw new AppError(
      `You've reached your ${user.plan} plan's limit of ${plan.booksPerPeriod} books per ${plan.periodLabel}. Upgrade your plan to borrow more.`,
      403
    );
  }

  const book = await booksCollection().findOneAndUpdate(
    { _id: new ObjectId(bookId), totalCopies: { $gt: 0 } },
    { $inc: { totalCopies: -1 } },
    { returnDocument: "after" }
  );
  if (!book) throw new AppError("No copies currently available for this book", 409);

  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + plan.loanDurationDays);

  const doc: BookingDoc = {
    userId: new ObjectId(userId),
    bookId: new ObjectId(bookId),
    bookTitle: book.title,
    bookCoverUrl: book.coverUrl,
    bookedAt: now,
    dueDate,
    returnedAt: null,
    status: "active",
  };
  const { insertedId } = await bookingsCollection().insertOne(doc);
  return toPublicBooking({ ...doc, _id: insertedId });
}

export async function listUserBookings(userId: string) {
  const bookings = await bookingsCollection().find({ userId: new ObjectId(userId) }).sort({ bookedAt: -1 }).toArray();
  return bookings.map(toPublicBooking);
}

export async function returnBooking(userId: string, bookingId: string) {
  if (!ObjectId.isValid(bookingId)) throw new AppError("Invalid booking id", 400);
  const booking = await bookingsCollection().findOne({ _id: new ObjectId(bookingId), userId: new ObjectId(userId) });
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.status === "returned") throw new AppError("This book has already been returned", 400);

  await bookingsCollection().updateOne({ _id: booking._id }, { $set: { returnedAt: new Date(), status: "returned" } });
  await booksCollection().updateOne({ _id: booking.bookId }, { $inc: { availableCopies: 1 } });
  return { success: true };
}