import { createApp } from "../src/app";
import { connectDB } from "../src/config/db";

const app = createApp();

let dbReady: Promise<void> | null = null;

app.use(async (_req, _res, next) => {
  if (!dbReady) {
    dbReady = connectDB().then(() => {});
  }
  await dbReady;
  next();
});

export default app;