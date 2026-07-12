import type { ObjectId } from "mongodb";
import { collection } from "../../db/collections";

export interface BookDoc {
  _id?: ObjectId;
  title: string;
  writer: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  coverUrl: string;
  price: number;
  pages: number;
  publishedDate: string;
  rating: number;
  reviewCount: number;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

export const booksCollection = () => collection<BookDoc>("books");