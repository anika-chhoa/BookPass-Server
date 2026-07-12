import bcrypt from "bcryptjs";
import { connectDB, closeDB } from "../config/db";
import { usersCollection } from "../modules/auth/auth.types";

const DEMO_EMAIL = "demo@libro.com";
const DEMO_PASSWORD = "Demo1234!";

async function seed() {
  await connectDB();
  const existing = await usersCollection().findOne({ email: DEMO_EMAIL });
  if (existing) {
    console.log("Demo user already exists — nothing to do.");
  } else {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    await usersCollection().insertOne({
      name: "Demo Reader",
      email: DEMO_EMAIL,
      passwordHash,
      role: "user",
      plan: "free",
      createdAt: new Date(),
    });
    console.log(`✅ Demo user created: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }
  await closeDB();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});