import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().min(1).max(200),
  writerId: z.string().min(1),
  category: z.string().min(1).max(60),
  shortDescription: z.string().min(1).max(300),
  description: z.string().min(1).max(5000),
  coverUrl: z.string().url(),
  images: z.array(z.string().url()).max(6).default([]),
  pages: z.number().int().min(1),
  publishedDate: z.string().min(1),
  totalCopies: z.number().int().min(1),
});

export const updateBookSchema = createBookSchema.partial();

export const listBooksQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: z.enum(["newest", "rating", "mostReviewed"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(8),
});