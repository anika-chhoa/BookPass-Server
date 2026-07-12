import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { usersCollection, type UserDoc } from "./auth.types";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../config/jwt";
import { AppError } from "../../middlewares/errorHandler";
import { randomUUID } from "crypto";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env";

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

const SALT_ROUNDS = 10;

function toPublicUser(user: UserDoc) {
  return { id: user._id!.toString(), name: user.name, email: user.email, role: user.role, plan: user.plan };
}

export async function registerUser(name: string, email: string, password: string) {
  const existing = await usersCollection().findOne({ email });
  if (existing) throw new AppError("An account with this email already exists", 409);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const doc: UserDoc = { name, email, passwordHash, role: "user", plan: "free", createdAt: new Date() };
  const { insertedId } = await usersCollection().insertOne(doc);
  return issueTokens({ ...doc, _id: insertedId });
}

export async function loginUser(email: string, password: string) {
  const user = await usersCollection().findOne({ email });
  if (!user) throw new AppError("Invalid email or password", 401);
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError("Invalid email or password", 401);
  return issueTokens(user);
}

export async function loginWithGoogle(idToken: string) {
  if (!googleClient) throw new AppError("Google login is not configured", 500);
  const ticket = await googleClient.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new AppError("Could not verify Google account", 401);

  let user = await usersCollection().findOne({ email: payload.email });
  if (!user) {
    const randomPassword = await bcrypt.hash(randomUUID(), 10);
    const doc: UserDoc = {
      name: payload.name ?? payload.email.split("@")[0],
      email: payload.email,
      passwordHash: randomPassword,
      role: "user",
      plan: "free",
      createdAt: new Date(),
    };
    const { insertedId } = await usersCollection().insertOne(doc);
    user = { ...doc, _id: insertedId };
  }
  return issueTokens(user);
}

export async function refreshSession(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const user = await usersCollection().findOne({ _id: new ObjectId(payload.userId) });
  if (!user) throw new AppError("User no longer exists", 401);
  return issueTokens(user);
}

function issueTokens(user: UserDoc) {
  const payload = { userId: user._id!.toString(), role: user.role };
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload), user: toPublicUser(user) };
}