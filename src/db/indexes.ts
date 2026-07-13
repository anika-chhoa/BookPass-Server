import { getDb } from "../config/db";

export async function ensureIndexes(): Promise<void> {
  const db = getDb();
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("books").createIndex({ title: "text", writer: "text" });
  await db.collection("books").createIndex({ category: 1 });
  await db.collection("bookings").createIndex({ userId: 1, bookedAt: -1 });
  await db
    .collection("favorites")
    .createIndex({ userId: 1, bookId: 1 }, { unique: true });
  await db
    .collection("reviews")
    .createIndex({ bookId: 1, userId: 1 }, { unique: true });

  console.log("✅ Indexes ensured (users.email unique, books text+category)");
}
