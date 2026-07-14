import type { ObjectId } from "mongodb";
import { collection } from "../../db/collections";

export interface BookDoc {
  _id?: ObjectId;
  title: string;
  writerId: ObjectId;
  writerName: string;
  writerPhotoUrl: string;
  category: string;
  description: string;
  coverUrl: string;
  pages: number;
  publishedDate: string;
  rating: number;
  reviewCount: number;
  totalCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

export const booksCollection = () => collection<BookDoc>("books");