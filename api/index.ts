import { createApp } from "../src/app";
import { connectDB } from "../src/config/db";

const app = createApp();

let dbReady: Promise<unknown> | null = null;

export default async function handler(req: any, res: any) {
  if (!dbReady) {
    dbReady = connectDB();
  }
  await dbReady;
  return app(req, res);
}
