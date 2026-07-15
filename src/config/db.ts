import { MongoClient, type Db } from "mongodb";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (env.NODE_ENV === "production") {
  // In serverless (Vercel), cache the promise on the global object so
  // warm invocations reuse the same connection instead of opening a new one.
  if (!global._mongoClientPromise) {
    const client = new MongoClient(env.MONGODB_URI, {
      maxPoolSize: 10,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In local dev, a plain module-level singleton is fine since the
  // process stays alive between requests.
  const client = new MongoClient(env.MONGODB_URI);
  clientPromise = client.connect();
}

let dbInstance: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (dbInstance) return dbInstance;
  const client = await clientPromise;
  dbInstance = client.db(env.DB_NAME);
  console.log(`✅ MongoDB connected → db: ${env.DB_NAME}`);
  return dbInstance;
}

export function getDb(): Db {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call connectDB() before getDb().");
  }
  return dbInstance;
}

export async function closeDB(): Promise<void> {
  const client = await clientPromise;
  await client.close();
  dbInstance = null;
  console.log("MongoDB connection closed");
}