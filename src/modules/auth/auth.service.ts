import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { usersCollection, type UserDoc } from "./auth.types";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../config/jwt";
import { AppError } from "../../middlewares/errorHandler";

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