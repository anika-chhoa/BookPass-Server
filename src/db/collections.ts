import { getDb } from "../config/db";
import type { Collection, Document } from "mongodb";


export function collection<T extends Document>(name: string): Collection<T> {
  return getDb().collection<T>(name);
}
