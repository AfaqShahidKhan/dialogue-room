import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import type { Express } from "express";
import request from "supertest";
import {
  startMemoryDb,
  stopMemoryDb,
  clearDatabase,
  buildApp,
  signupUser,
  cookieHeader,
  findForbiddenKeys,
} from "./helpers/setup";

let app: Express;

beforeAll(async () => {
  await startMemoryDb();
  app = await buildApp();
});

afterAll(async () => {
  await stopMemoryDb();
});

beforeEach(async () => {
  await clearDatabase();
});

describe("Recursive sensitive-key scan across every user-bearing response", () => {
  it("signup response", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      name: "Sanitize Signup",
      email: "sanitize-signup@example.com",
      password: "Password123!",
      passwordConfirm: "Password123!",
      agreedToTerms: true,
    });
    expect(res.status).toBe(201);
    expect(findForbiddenKeys(res.body)).toEqual([]);
  });

  it("login response", async () => {
    const email = "sanitize-login@example.com";
    const password = "Password123!";
    await signupUser(app, { email, password });

    const res = await request(app).post("/api/v1/auth/login").send({ email, password });
    expect(res.status).toBe(200);
    expect(findForbiddenKeys(res.body)).toEqual([]);
  });

  it("GET /users/me response", async () => {
    const { cookies } = await signupUser(app, { email: "sanitize-me@example.com" });

    const res = await request(app).get("/api/v1/users/me").set("Cookie", cookieHeader(cookies));
    expect(res.status).toBe(200);
    expect(findForbiddenKeys(res.body)).toEqual([]);
  });

  it("discovery response", async () => {
    const { cookies } = await signupUser(app, { email: "sanitize-discover-viewer@example.com" });
    await signupUser(app, { email: "sanitize-discover-other@example.com" });

    const res = await request(app).get("/api/v1/users").set("Cookie", cookieHeader(cookies));
    expect(res.status).toBe(200);
    expect(findForbiddenKeys(res.body)).toEqual([]);
  });

  it("friends list response", async () => {
    const a = await signupUser(app, { email: "sanitize-friendsA@example.com" });
    const b = await signupUser(app, { email: "sanitize-friendsB@example.com" });
    const created = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    expect(findForbiddenKeys(created.body)).toEqual([]);

    const friendshipId = created.body.data.friendship._id;
    const accepted = await request(app)
      .patch(`/api/v1/friendships/${friendshipId}/accept`)
      .set("Cookie", cookieHeader(b.cookies));
    expect(findForbiddenKeys(accepted.body)).toEqual([]);

    const res = await request(app)
      .get("/api/v1/friendships/friends")
      .set("Cookie", cookieHeader(a.cookies));
    expect(res.status).toBe(200);
    expect(findForbiddenKeys(res.body)).toEqual([]);
  });

  it("conversations list + messages responses", async () => {
    const a = await signupUser(app, { email: "sanitize-convA@example.com" });
    const b = await signupUser(app, { email: "sanitize-convB@example.com" });
    const created = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    const friendshipId = created.body.data.friendship._id;
    await request(app)
      .patch(`/api/v1/friendships/${friendshipId}/accept`)
      .set("Cookie", cookieHeader(b.cookies));

    const conversation = await request(app)
      .post("/api/v1/conversations")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ userId: b.user._id });
    expect(findForbiddenKeys(conversation.body)).toEqual([]);
    const conversationId = conversation.body.data.conversation._id;

    const sent = await request(app)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .set("Cookie", cookieHeader(a.cookies))
      .send({ content: "hi there" });
    expect(findForbiddenKeys(sent.body)).toEqual([]);

    const list = await request(app)
      .get("/api/v1/conversations")
      .set("Cookie", cookieHeader(a.cookies));
    expect(list.status).toBe(200);
    expect(findForbiddenKeys(list.body)).toEqual([]);

    const messages = await request(app)
      .get(`/api/v1/conversations/${conversationId}/messages`)
      .set("Cookie", cookieHeader(a.cookies));
    expect(messages.status).toBe(200);
    expect(findForbiddenKeys(messages.body)).toEqual([]);
  });
});
