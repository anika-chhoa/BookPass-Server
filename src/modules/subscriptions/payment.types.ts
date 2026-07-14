import type { ObjectId } from "mongodb";
import { collection } from "../../db/collections";

export interface PaymentDoc {
  _id?: ObjectId;
  userId: ObjectId;
  userName: string;
  userEmail: string;
  plan: "pro" | "premium";
  amountTotal: number;
  currency: string;
  stripeSessionId: string;
  stripeSubscriptionId: string;
  status: "paid";
  createdAt: Date;
}

export const paymentsCollection = () => collection<PaymentDoc>("payments");