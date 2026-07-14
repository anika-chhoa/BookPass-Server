import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { success } from "../../utils/apiResponse";
import { AppError } from "../../middlewares/errorHandler";
import { createCheckoutSessionSchema } from "./subscriptions.schema";
import { createCheckoutSession, handleStripeWebhook } from "./subscriptions.service";

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const { plan } = createCheckoutSessionSchema.parse(req.body);
  const result = await createCheckoutSession(req.user!.userId, plan);
  return success(res, result, "Checkout session created");
});

export const webhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    throw new AppError("Missing Stripe signature header", 400);
  }
  await handleStripeWebhook(req.body as Buffer, signature);
  return res.json({ received: true });
});