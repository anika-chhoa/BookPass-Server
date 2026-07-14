import type { ObjectId } from "mongodb";
import { collection } from "../../db/collections";

export interface WriterDoc {
  _id?: ObjectId;
  name: string;
  photoUrl: string;
  createdAt: Date;
}

export const writersCollection = () => collection<WriterDoc>("writers");