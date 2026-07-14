import { ObjectId } from "mongodb";
import { reviewsCollection, type ReviewDoc } from "./review.types";
import { booksCollection } from "../books/book.types";
import { usersCollection } from "../auth/auth.types";
import { DEFAULT_AVATAR_URL } from "../auth/auth.service";
import { AppError } from "../../middlewares/errorHandler";

function toPublicReview(r: ReviewDoc) {
  const { _id, bookId, userId, ...rest } = r;
  return { id: _id!.toString(), bookId: bookId.toString(), ...rest };
}

export async function createReview(userId: string, bookId: string, rating: number, comment: string) {
  if (!ObjectId.isValid(bookId)) throw new AppError("Invalid book id", 400);
  const book = await booksCollection().findOne({ _id: new ObjectId(bookId) });
  if (!book) throw new AppError("Book not found", 404);
  const existing = await reviewsCollection().findOne({ bookId: new ObjectId(bookId), userId: new ObjectId(userId) });
  if (existing) throw new AppError("You've already reviewed this book", 409);
  const user = await usersCollection().findOne({ _id: new ObjectId(userId) });
  if (!user) throw new AppError("User not found", 404);
  const doc: ReviewDoc = {
    bookId: new ObjectId(bookId),
    userId: new ObjectId(userId),
    userName: user.name,
    userAvatarUrl: user.avatarUrl ?? DEFAULT_AVATAR_URL,
    rating,
    comment,
    createdAt: new Date(),
  };
  const { insertedId } = await reviewsCollection().insertOne(doc);
  const newReviewCount = book.reviewCount + 1;
  const newRating = (book.rating * book.reviewCount + rating) / newReviewCount;
  await booksCollection().updateOne({ _id: book._id }, { $set: { rating: Math.round(newRating * 10) / 10, reviewCount: newReviewCount } });
  return toPublicReview({ ...doc, _id: insertedId });
}

export async function listBookReviews(bookId: string) {
  if (!ObjectId.isValid(bookId)) throw new AppError("Invalid book id", 400);
  const reviews = await reviewsCollection().find({ bookId: new ObjectId(bookId) }).sort({ createdAt: -1 }).toArray();
  return reviews.map(toPublicReview);
}

export async function listFeaturedReviews(limit: number) {
  const reviews = await reviewsCollection()
    .find({ rating: { $gte: 4 } })
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit)
    .toArray();
  return reviews.map(toPublicReview);
}