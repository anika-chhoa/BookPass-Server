import { getDb } from "../config/db";



export async function ensureIndexes(): Promise<void> {
  const db = getDb();
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  console.log("✅ Indexes ensured (users.email unique)");
}
