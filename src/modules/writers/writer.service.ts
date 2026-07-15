import { ObjectId } from "mongodb";
import { writersCollection, type WriterDoc } from "./writer.types";
import { AppError } from "../../middlewares/errorHandler";

function toPublicWriter(w: WriterDoc) {
  return { id: w._id!.toString(), name: w.name, photoUrl: w.photoUrl };
}

export async function createWriter(name: string, photoUrl: string) {
  const doc: WriterDoc = { name, photoUrl, createdAt: new Date() };
  const { insertedId } = await writersCollection().insertOne(doc);
  return toPublicWriter({ ...doc, _id: insertedId });
}

export async function listWriters(limit?: number) {
  let query = writersCollection().find({}).sort({ createdAt: -1 });
  if (limit) query = query.limit(limit);
  return (await query.toArray()).map(toPublicWriter);
}

export async function getWriterById(id: string) {
  if (!ObjectId.isValid(id)) throw new AppError("Invalid writer id", 400);
  const writer = await writersCollection().findOne({ _id: new ObjectId(id) });
  if (!writer) throw new AppError("Writer not found", 404);
  return writer;
}