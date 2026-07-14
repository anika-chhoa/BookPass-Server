import { usersCollection } from "../auth/auth.types";
import { booksCollection } from "../books/book.types";
import { reviewsCollection } from "../reviews/review.types";

export async function getPublicStats() {
  const [totalBooks, totalUsers, totalReviews] = await Promise.all([
    booksCollection().countDocuments(),
    usersCollection().countDocuments(),
    reviewsCollection().countDocuments(),
  ]);
  return { totalBooks, totalUsers, totalReviews };
}