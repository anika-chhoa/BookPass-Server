import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().min(1).max(200),
  writer: z.string().min(1).max(120),
  category: z.string().min(1).max(60),
  shortDescription: z.string().min(1).max(300),
  fullDescription: z.string().min(1).max(5000),
  coverUrl: z.string().url(),
  price: z.number().min(0),
  pages: z.number().int().min(1),
  publishedDate: z.string().min(1),
  totalCopies: z.number().int().min(1),
});

export const updateBookSchema = createBookSchema.partial();

export const listBooksQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "rating", "priceAsc", "priceDesc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});