import dns from "dns";
import { createApp } from "./app";
import { closeDB, connectDB } from "./config/db";
import { env } from "./config/env";
import { ensureIndexes } from "./db/indexes";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function bootstrap() {
  await connectDB();
  await ensureIndexes();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 OpenShelf listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    console.log("\nShutting down gracefully...");
    server.close();
    await closeDB();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
