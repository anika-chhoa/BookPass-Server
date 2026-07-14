import { z } from "zod";

export const createWriterSchema = z.object({
  name: z.string().min(2).max(120),
  photoUrl: z.string().url(),
});