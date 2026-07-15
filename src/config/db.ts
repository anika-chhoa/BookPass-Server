import { MongoClient, type Db } from "mongodb";
import { env } from "./env";

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let connectingPromise: Promise<Db> | null = null;

export async function connectDB(): Promise<Db> {
  if (dbInstance) return dbInstance;
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    client = new MongoClient(env.MONGODB_URI, { maxPoolSize: 10 });
    await client.connect();
    dbInstance = client.db(env.DB_NAME);
    console.log(`✅ MongoDB connected → db: ${env.DB_NAME}`);
    return dbInstance;
  })();

  return connectingPromise;
}

export function getDb(): Db {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call connectDB() before getDb().");
  }
  return dbInstance;
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    dbInstance = null;
    connectingPromise = null;
    console.log("MongoDB connection closed");
  }
}