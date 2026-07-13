import type { ObjectId } from "mongodb";
import { collection } from "../../db/collections";

export interface ReviewDoc {
  _id?: ObjectId;
  bookId: ObjectId;
  userId: ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export const reviewsCollection = () => collection<ReviewDoc>("reviews");