import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().min(1).max(200),
  writerId: z.string().min(1),
  category: z.string().min(1).max(60),
  description: z.string().min(1).max(5000),
  coverUrl: z.string().url(),
  pages: z.number().int().min(1),
  publishedDate: z.string().min(1),
  totalCopies: z.number().int().min(1),
});

export const updateBookSchema = createBookSchema.partial();

export const listBooksQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "rating"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});