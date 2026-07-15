import { ObjectId } from "mongodb";
import { favoritesCollection, type FavoriteDoc } from "./favorite.types";
import { booksCollection } from "../books/book.types";
import { AppError } from "../../middlewares/errorHandler";

function toPublicFavorite(f: FavoriteDoc) {
  const { _id, userId, bookId, ...rest } = f;
  return { id: _id!.toString(), bookId: bookId.toString(), ...rest };
}

export async function addFavorite(userId: string, bookId: string) {
  if (!ObjectId.isValid(bookId)) throw new AppError("Invalid book id", 400);
  const existing = await favoritesCollection().findOne({ userId: new ObjectId(userId), bookId: new ObjectId(bookId) });
  if (existing) return toPublicFavorite(existing);

  const book = await booksCollection().findOne({ _id: new ObjectId(bookId) });
  if (!book) throw new AppError("Book not found", 404);

  const doc: FavoriteDoc = {
    userId: new ObjectId(userId),
    bookId: new ObjectId(bookId),
    bookTitle: book.title,
    bookCoverUrl: book.coverUrl,
    bookWriter: book.writerName,
    createdAt: new Date(),
  };
  const { insertedId } = await favoritesCollection().insertOne(doc);
  return toPublicFavorite({ ...doc, _id: insertedId });
}

export async function removeFavorite(userId: string, bookId: string) {
  if (!ObjectId.isValid(bookId)) throw new AppError("Invalid book id", 400);
  await favoritesCollection().deleteOne({ userId: new ObjectId(userId), bookId: new ObjectId(bookId) });
}

export async function listUserFavorites(userId: string) {
  const favorites = await favoritesCollection().find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
  return favorites.map(toPublicFavorite);
}