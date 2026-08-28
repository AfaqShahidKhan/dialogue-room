import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().default(8080),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 chars"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  EMAIL_HOST: z.string().optional().or(z.literal("")),
  EMAIL_PORT: z.coerce.number().int().default(2525),
  EMAIL_USERNAME: z.string().optional().or(z.literal("")),
  EMAIL_PASSWORD: z.string().optional().or(z.literal("")),
  EMAIL_FROM: z.string().default("Dialogue Room <no-reply@dialogueroom.local>"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`   ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isDev = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
