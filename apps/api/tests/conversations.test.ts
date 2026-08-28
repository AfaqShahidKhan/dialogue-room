import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import type { Express } from "express";
import request from "supertest";
import { startMemoryDb, stopMemoryDb, clearDatabase, buildApp, signupUser, cookieHeader } from "./helpers/setup";

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

async function makeFriends(emailA: string, emailB: string) {
  const a = await signupUser(app, { email: emailA });
  const b = await signupUser(app, { email: emailB });
  const created = await request(app)
    .post("/api/v1/friendships")
    .set("Cookie", cookieHeader(a.cookies))
    .send({ recipientId: b.user._id });
  const friendshipId = created.body.data.friendship._id;
  await request(app)
    .patch(`/api/v1/friendships/${friendshipId}/accept`)
    .set("Cookie", cookieHeader(b.cookies));
  return { a, b };
}

describe("POST /api/v1/conversations", () => {
  it("returns 403 when not friends", async () => {
    const a = await signupUser(app, { email: "convNotFriendA@example.com" });
    const b = await signupUser(app, { email: "convNotFriendB@example.com" });

    const res = await request(app)
      .post("/api/v1/conversations")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ userId: b.user._id });

    expect(res.status).toBe(403);
  });

  it("creates a conversation when friends", async () => {
    const { a, b } = await makeFriends("convFriendA@example.com", "convFriendB@example.com");

    const res = await request(app)
      .post("/api/v1/conversations")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ userId: b.user._id });

    expect(res.status).toBe(201);
    expect(res.body.data.conversation.otherUser._id).toBe(b.user._id);
    expect(res.body.data.conversation.unreadCount).toBe(0);
  });

  it("is idempotent — same conversation id from both directions", async () => {
    const { a, b } = await makeFriends("convIdemA@example.com", "convIdemB@example.com");

    const fromA = await request(app)
      .post("/api/v1/conversations")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ userId: b.user._id });
    const fromB = await request(app)
      .post("/api/v1/conversations")
      .set("Cookie", cookieHeader(b.cookies))
      .send({ userId: a.user._id });

    expect(fromA.status).toBe(201);
    expect(fromB.status).toBe(201);
    expect(fromA.body.data.conversation._id).toBe(fromB.body.data.conversation._id);
  });
});

describe("GET /api/v1/conversations (list)", () => {
  it("returns ConversationListItem shape with correct unreadCount math", async () => {
    const { a, b } = await makeFriends("convListA@example.com", "convListB@example.com");

    const createRes = await request(app)
      .post("/api/v1/conversations")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ userId: b.user._id });
    const conversationId = createRes.body.data.conversation._id;

    // b sends 3 messages to a; a hasn't read yet.
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post(`/api/v1/conversations/${conversationId}/messages`)
        .set("Cookie", cookieHeader(b.cookies))
        .send({ content: `msg ${i}` });
    }

    const listForA = await request(app)
      .get("/api/v1/conversations")
      .set("Cookie", cookieHeader(a.cookies));

    expect(listForA.status).toBe(200);
    const convo = listForA.body.data.conversations.find(
      (c: { _id: string }) => c._id === conversationId,
    );
    expect(convo).toBeDefined();
    expect(convo.otherUser._id).toBe(b.user._id);
    expect(convo.unreadCount).toBe(3);
    expect(convo.lastMessagePreview).toBe("msg 2");
    expect(convo.lastMessageAt).toBeTruthy();

    // Sender's own unreadCount for this conversation stays 0.
    const listForB = await request(app)
      .get("/api/v1/conversations")
      .set("Cookie", cookieHeader(b.cookies));
    const convoForB = listForB.body.data.conversations.find(
      (c: { _id: string }) => c._id === conversationId,
    );
    expect(convoForB.unreadCount).toBe(0);
  });
});

describe("Messages", () => {
  it("POST persists trimmed content", async () => {
    const { a, b } = await makeFriends("msgTrimA@example.com", "msgTrimB@example.com");
    const createRes = await request(app)
      .post("/api/v1/conversations")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ userId: b.user._id });
    const conversationId = createRes.body.data.conversation._id;

    const res = await request(app)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .set("Cookie", cookieHeader(a.cookies))
      .send({ content: "   hello there   " });

    expect(res.status).toBe(201);
    expect(res.body.data.message.content).toBe("hello there");
  });

  it("rejects empty content with 400", async () => {
    const { a, b } = await makeFriends("msgEmptyA@example.com", "msgEmptyB@example.com");
    const createRes = await request(app)
      .post("/api/v1/conversations")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ userId: b.user._id });
    const conversationId = createRes.body.data.conversation._id;

    const res = await request(app)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .set("Cookie", cookieHeader(a.cookies))
      .send({ content: "   " });

    expect(res.status).toBe(400);
  });

  it("rejects content over 2000 chars with 400", async () => {
    const { a, b } = await makeFriends("msgTooLongA@example.com", "msgTooLongB@example.com");
    const createRes = await request(app)
      .post("/api/v1/conversations")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ userId: b.user._id });
    const conversationId = createRes.body.data.conversation._id;

    const res = await request(app)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .set("Cookie", cookieHeader(a.cookies))
      .send({ content: "x".repeat(2001) });

    expect(res.status).toBe(400);
  });

  it("returns 403 for a non-participant trying to send", async () => {
    const { a, b } = await makeFriends("msgNonPartA@example.com", "msgNonPartB@example.com");
    const stranger = await signupUser(app, { email: "msgStranger@example.com" });
    const createRes = await request(app)
      .post("/api/v1/conversations")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ userId: b.user._id });
    const conversationId = createRes.body.data.conversation._id;

    const res = await request(app)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .set("Cookie", cookieHeader(stranger.cookies))
      .send({ content: "sneaky" });

    expect(res.status).toBe(403);
  });

  it("returns 404 for messages on a non-existent conversation", async () => {
    const a = await signupUser(app, { email: "msg404A@example.com" });
    const fakeId = "507f1f77bcf86cd799439011";

    const res = await request(app)
      .post(`/api/v1/conversations/${fakeId}/messages`)
      .set("Cookie", cookieHeader(a.cookies))
      .send({ content: "hello" });

    expect(res.status).toBe(404);
  });

  it("updates lastMessagePreview/lastMessageAt on send", async () => {
    const { a, b } = await makeFriends("msgPreviewA@example.com", "msgPreviewB@example.com");
    const createRes = await request(app)
      .post("/api/v1/conversations")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ userId: b.user._id });
    const conversationId = createRes.body.data.conversation._id;

    await request(app)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .set("Cookie", cookieHeader(a.cookies))
      .send({ content: "first message" });

    const list = await request(app)
      .get("/api/v1/conversations")
      .set("Cookie", cookieHeader(a.cookies));
    const convo = list.body.data.conversations.find((c: { _id: string }) => c._id === conversationId);
    expect(convo.lastMessagePreview).toBe("first message");
    expect(convo.lastMessageAt).toBeTruthy();
  });

  describe("cursor pagination", () => {
    it("walks 75 seeded messages in pages of 30, chronological ascending, no dupes/gaps", async () => {
      const { a, b } = await makeFriends("cursorA@example.com", "cursorB@example.com");
      const createRes = await request(app)
        .post("/api/v1/conversations")
        .set("Cookie", cookieHeader(a.cookies))
        .send({ userId: b.user._id });
      const conversationId = createRes.body.data.conversation._id;

      const TOTAL = 75;
      for (let i = 0; i < TOTAL; i++) {
        const sender = i % 2 === 0 ? a : b;
        const res = await request(app)
          .post(`/api/v1/conversations/${conversationId}/messages`)
          .set("Cookie", cookieHeader(sender.cookies))
          .send({ content: `message-${i}` });
        expect(res.status).toBe(201);
      }

      const collected: string[] = [];
      let cursor: string | null = null;
      let pageCount = 0;
      const seenIds = new Set<string>();

      do {
        const query: Record<string, string> = { limit: "30" };
        if (cursor) query.before = cursor;

        const res = await request(app)
          .get(`/api/v1/conversations/${conversationId}/messages`)
          .query(query)
          .set("Cookie", cookieHeader(a.cookies));

        expect(res.status).toBe(200);
        const { messages, nextCursor } = res.body.data as {
          messages: { _id: string; content: string; createdAt: string }[];
          nextCursor: string | null;
        };

        // messages arrive newest-cursor-first-page but each page itself is
        // chronological ascending; we prepend nothing — the FIRST page fetched
        // (no cursor) is the newest 30 messages in ascending order, so to
        // reconstruct full chronological history we walk backwards via
        // nextCursor and prepend each older page.
        for (const m of messages) {
          expect(seenIds.has(m._id)).toBe(false);
          seenIds.add(m._id);
        }

        // Verify ascending order within the page itself.
        for (let i = 1; i < messages.length; i++) {
          expect(new Date(messages[i]!.createdAt).getTime()).toBeGreaterThanOrEqual(
            new Date(messages[i - 1]!.createdAt).getTime(),
          );
        }

        collected.unshift(...messages.map((m) => m.content));
        cursor = nextCursor;
        pageCount += 1;
        expect(pageCount).toBeLessThanOrEqual(10); // sanity guard against infinite loop
      } while (cursor);

      expect(seenIds.size).toBe(TOTAL);
      expect(collected).toHaveLength(TOTAL);
      expect(collected).toEqual(Array.from({ length: TOTAL }, (_, i) => `message-${i}`));
      // 75 messages at 30/page => 3 pages (30, 30, 15).
      expect(pageCount).toBe(3);
    });
  });

  describe("PATCH /:id/read", () => {
    it("flips readAt and zeroes unreadCount", async () => {
      const { a, b } = await makeFriends("readFlipA@example.com", "readFlipB@example.com");
      const createRes = await request(app)
        .post("/api/v1/conversations")
        .set("Cookie", cookieHeader(a.cookies))
        .send({ userId: b.user._id });
      const conversationId = createRes.body.data.conversation._id;

      await request(app)
        .post(`/api/v1/conversations/${conversationId}/messages`)
        .set("Cookie", cookieHeader(b.cookies))
        .send({ content: "unread for a" });

      const beforeRead = await request(app)
        .get("/api/v1/conversations")
        .set("Cookie", cookieHeader(a.cookies));
      const convoBefore = beforeRead.body.data.conversations.find(
        (c: { _id: string }) => c._id === conversationId,
      );
      expect(convoBefore.unreadCount).toBe(1);

      const readRes = await request(app)
        .patch(`/api/v1/conversations/${conversationId}/read`)
        .set("Cookie", cookieHeader(a.cookies));
      expect(readRes.status).toBe(200);

      const afterRead = await request(app)
        .get("/api/v1/conversations")
        .set("Cookie", cookieHeader(a.cookies));
      const convoAfter = afterRead.body.data.conversations.find(
        (c: { _id: string }) => c._id === conversationId,
      );
      expect(convoAfter.unreadCount).toBe(0);

      const messagesRes = await request(app)
        .get(`/api/v1/conversations/${conversationId}/messages`)
        .set("Cookie", cookieHeader(a.cookies));
      const sentMessage = messagesRes.body.data.messages.find(
        (m: { content: string }) => m.content === "unread for a",
      );
      expect(sentMessage.readAt).toBeTruthy();
    });

    it("non-participant cannot read messages or mark read", async () => {
      const { a, b } = await makeFriends("readNonPartA@example.com", "readNonPartB@example.com");
      const stranger = await signupUser(app, { email: "readStranger@example.com" });
      const createRes = await request(app)
        .post("/api/v1/conversations")
        .set("Cookie", cookieHeader(a.cookies))
        .send({ userId: b.user._id });
      const conversationId = createRes.body.data.conversation._id;

      const getMessages = await request(app)
        .get(`/api/v1/conversations/${conversationId}/messages`)
        .set("Cookie", cookieHeader(stranger.cookies));
      expect(getMessages.status).toBe(403);

      const markRead = await request(app)
        .patch(`/api/v1/conversations/${conversationId}/read`)
        .set("Cookie", cookieHeader(stranger.cookies));
      expect(markRead.status).toBe(403);
    });
  });
});
