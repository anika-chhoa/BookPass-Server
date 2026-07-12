import { ObjectId } from "mongodb";
import { booksCollection, type BookDoc } from "./book.types";
import { AppError } from "../../middlewares/errorHandler";
import type { z } from "zod";
import type { createBookSchema, updateBookSchema, listBooksQuerySchema } from "./book.schema";

type CreateInput = z.infer<typeof createBookSchema>;
type UpdateInput = z.infer<typeof updateBookSchema>;
type ListQuery = z.infer<typeof listBooksQuerySchema>;

export function toPublicBook(book: BookDoc) {
  const { _id, ...rest } = book;
  return { id: _id!.toString(), ...rest };
}

export async function createBook(input: CreateInput) {
  const now = new Date();
  const doc: BookDoc = { ...input, rating: 0, reviewCount: 0, availableCopies: input.totalCopies, createdAt: now, updatedAt: now };
  const { insertedId } = await booksCollection().insertOne(doc);
  return { ...doc, _id: insertedId };
}

export async function listBooks(query: ListQuery) {
  const filter: Record<string, unknown> = {};
  if (query.category) filter.category = query.category;
  if (query.search) filter.$text = { $search: query.search };

  const sortMap = {
    newest: { createdAt: -1 as const },
    rating: { rating: -1 as const },
    priceAsc: { price: 1 as const },
    priceDesc: { price: -1 as const },
  };
  const sort = sortMap[query.sort ?? "newest"];
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    booksCollection().find(filter).sort(sort).skip(skip).limit(query.limit).toArray(),
    booksCollection().countDocuments(filter),
  ]);
  return { items, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
}

export async function getBookById(id: string) {
  if (!ObjectId.isValid(id)) throw new AppError("Invalid book id", 400);
  const book = await booksCollection().findOne({ _id: new ObjectId(id) });
  if (!book) throw new AppError("Book not found", 404);
  return book;
}

export async function updateBook(id: string, input: UpdateInput) {
  if (!ObjectId.isValid(id)) throw new AppError("Invalid book id", 400);
  const result = await booksCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result) throw new AppError("Book not found", 404);
  return result;
}

export async function deleteBook(id: string) {
  if (!ObjectId.isValid(id)) throw new AppError("Invalid book id", 400);
  const result = await booksCollection().deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) throw new AppError("Book not found", 404);
}