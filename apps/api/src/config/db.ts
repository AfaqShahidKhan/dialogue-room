import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase(uri: string = env.MONGODB_URI): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log(`✅ MongoDB connected: ${mongoose.connection.name}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
