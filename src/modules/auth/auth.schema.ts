import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  avatarUrl: z.string().url().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const googleLoginSchema = z.object({
  idToken: z.string().min(1),
});

export const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    avatarUrl: z.string().url().optional(),
  })
  .refine((data) => data.name !== undefined || data.avatarUrl !== undefined, {
    message: "At least one field must be provided",
  });