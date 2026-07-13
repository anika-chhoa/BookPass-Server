import type { ObjectId } from "mongodb";
import { collection } from "../../db/collections";

export interface FavoriteDoc {
  _id?: ObjectId;
  userId: ObjectId;
  bookId: ObjectId;
  bookTitle: string;
  bookCoverUrl: string;
  bookWriter: string;
  createdAt: Date;
}

export const favoritesCollection = () => collection<FavoriteDoc>("favorites");