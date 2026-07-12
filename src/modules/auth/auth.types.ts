import type { ObjectId } from "mongodb";
import { collection } from "../../db/collections";

export interface UserDoc {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  plan: "free" | "pro" | "premium";
  createdAt: Date;
}

export const usersCollection = () => collection<UserDoc>("users");