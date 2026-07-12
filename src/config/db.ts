import { MongoClient, type Db } from "mongodb";
import { env } from "./env";


let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  db = client.db(env.DB_NAME);

  console.log(`✅ MongoDB connected → db: ${env.DB_NAME}`);
  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() before getDb().");
  }
  return db;
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("MongoDB connection closed");
  }
}
