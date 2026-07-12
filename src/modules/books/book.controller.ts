import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { success } from "../../utils/apiResponse";
import { createBookSchema, updateBookSchema, listBooksQuerySchema } from "./book.schema";
import { createBook, listBooks, getBookById, updateBook, deleteBook, toPublicBook } from "./book.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createBookSchema.parse(req.body);
  const book = await createBook(input);
  return success(res, toPublicBook(book), "Book created", 201);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = listBooksQuerySchema.parse(req.query);
  const result = await listBooks(query);
  return success(res, { ...result, items: result.items.map(toPublicBook) });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const book = await getBookById(req.params.id);
  return success(res, toPublicBook(book));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = updateBookSchema.parse(req.body);
  const book = await updateBook(req.params.id, input);
  return success(res, toPublicBook(book), "Book updated");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteBook(req.params.id);
  return success(res, null, "Book deleted");
});