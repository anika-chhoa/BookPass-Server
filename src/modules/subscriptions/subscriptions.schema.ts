import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  plan: z.enum(["pro", "premium"]),
});