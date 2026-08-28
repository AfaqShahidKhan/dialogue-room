import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import type { Express } from "express";
import request from "supertest";

// ---------------------------------------------------------------------------
// Env MUST be fully set before anything imports `config/env.ts` (zod-validated
// at import time) or `models/*` (which import config/env transitively via
// mongoose connection helpers / tokens.ts). This module is imported first by
// every test file, before any other project import, to guarantee ordering.
// ---------------------------------------------------------------------------
process.env.NODE_ENV = "test";
process.env.CLIENT_URL = "http://localhost:3000";
process.env.JWT_ACCESS_SECRET = "a".repeat(64);
process.env.JWT_REFRESH_SECRET = "b".repeat(64);
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "30d";
process.env.EMAIL_HOST = ""; // force console-log email path (no SMTP in tests)
process.env.EMAIL_USERNAME = "";
process.env.EMAIL_PASSWORD = "";

let mongod: MongoMemoryServer | null = null;

/**
 * Boots the in-memory Mongo instance, points MONGODB_URI at it, and connects
 * mongoose. Call once per test file, before importing createApp — the app
 * itself never calls mongoose.connect() (that's server.ts's job at real boot),
 * so tests own the connection lifecycle directly.
 */
export async function startMemoryDb(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri("dialogue-room-test");
  process.env.MONGODB_URI = uri;
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}

export async function stopMemoryDb(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}

/** Deletes all documents from every registered collection — call in beforeEach for isolation. */
export async function clearDatabase(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

// ---------------------------------------------------------------------------
// App bootstrap — dynamic import so env vars above are guaranteed to be set
// before `createApp`'s transitive import of `config/env.ts` runs.
// ---------------------------------------------------------------------------
export async function buildApp(): Promise<Express> {
  const { createApp } = await import("../../src/app");
  return createApp();
}

// ---------------------------------------------------------------------------
// Test data / auth helpers
// ---------------------------------------------------------------------------
export interface SignupOverrides {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  agreedToTerms?: boolean;
}

export interface SignedUpUser {
  user: Record<string, unknown>;
  cookies: string[];
  raw: request.Response;
}

let signupCounter = 0;

/** Signs up a new user with sane defaults, returns the sanitized user + Set-Cookie headers. */
export async function signupUser(app: Express, overrides: SignupOverrides = {}): Promise<SignedUpUser> {
  signupCounter += 1;
  const defaultEmail = `user${signupCounter}.${Date.now()}@example.com`;
  const body = {
    name: overrides.name ?? `Test User ${signupCounter}`,
    email: overrides.email ?? defaultEmail,
    password: overrides.password ?? "Password123!",
    passwordConfirm: overrides.passwordConfirm ?? overrides.password ?? "Password123!",
    agreedToTerms: overrides.agreedToTerms ?? true,
  };

  const res = await request(app).post("/api/v1/auth/signup").send(body);
  if (res.status !== 201) {
    throw new Error(`signupUser failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  const cookies = extractSetCookieArray(res);
  return { user: res.body.data.user, cookies, raw: res };
}

/** Normalizes supertest's Set-Cookie header (string | string[] | undefined) into a string[]. */
export function extractSetCookieArray(res: request.Response): string[] {
  const raw = res.headers["set-cookie"];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

/** Extracts the raw value of a named cookie from a supertest response's Set-Cookie headers. */
export function extractCookie(res: request.Response, name: string): string | undefined {
  const cookies = extractSetCookieArray(res);
  for (const cookie of cookies) {
    const match = cookie.match(new RegExp(`^${name}=([^;]+)`));
    if (match) return match[1];
  }
  return undefined;
}

/** Builds a `name=value` Cookie header string from a signup/login response's Set-Cookie array. */
export function cookieHeader(cookies: string[]): string {
  return cookies.map((c) => c.split(";")[0]).join("; ");
}

// ---------------------------------------------------------------------------
// Recursive sensitive-key walk — used by sanitize.test.ts and inline elsewhere.
// ---------------------------------------------------------------------------
const FORBIDDEN_KEYS = ["password", "passwordResetToken", "passwordResetExpires"];

export function findForbiddenKeys(value: unknown, path = "$"): string[] {
  const hits: string[] = [];
  if (Array.isArray(value)) {
    value.forEach((item, i) => hits.push(...findForbiddenKeys(item, `${path}[${i}]`)));
  } else if (value !== null && typeof value === "object") {
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (FORBIDDEN_KEYS.includes(key)) {
        hits.push(`${path}.${key}`);
      }
      hits.push(...findForbiddenKeys(val, `${path}.${key}`));
    }
  }
  return hits;
}
