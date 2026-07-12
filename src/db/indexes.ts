import { getDb } from "../config/db";

export async function ensureIndexes(): Promise<void> {
  const db = getDb();
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("books").createIndex({ title: "text", writer: "text" });
  await db.collection("books").createIndex({ category: 1 });
  console.log("✅ Indexes ensured (users.email unique, books text+category)");
}