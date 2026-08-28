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

describe("POST /api/v1/friendships (send request)", () => {
  it("creates a pending request with 201", async () => {
    const a = await signupUser(app, { email: "sendA@example.com" });
    const b = await signupUser(app, { email: "sendB@example.com" });

    const res = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });

    expect(res.status).toBe(201);
    expect(res.body.data.friendship.status).toBe("pending");
  });

  it("rejects sending a request to yourself with 400", async () => {
    const a = await signupUser(app, { email: "selfreq@example.com" });

    const res = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: a.user._id });

    expect(res.status).toBe(400);
  });

  it("rejects a duplicate request (either direction) with 409", async () => {
    const a = await signupUser(app, { email: "dupA@example.com" });
    const b = await signupUser(app, { email: "dupB@example.com" });

    const first = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    expect(first.status).toBe(201);

    const sameDirection = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    expect(sameDirection.status).toBe(409);

    const reverseDirection = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(b.cookies))
      .send({ recipientId: a.user._id });
    expect(reverseDirection.status).toBe(409);
  });
});

describe("PATCH /api/v1/friendships/:id/accept", () => {
  it("recipient can accept", async () => {
    const a = await signupUser(app, { email: "acceptA@example.com" });
    const b = await signupUser(app, { email: "acceptB@example.com" });

    const created = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    const friendshipId = created.body.data.friendship._id;

    const res = await request(app)
      .patch(`/api/v1/friendships/${friendshipId}/accept`)
      .set("Cookie", cookieHeader(b.cookies));

    expect(res.status).toBe(200);
    expect(res.body.data.friendship.status).toBe("accepted");
  });

  it("requester cannot accept their own request (assert actual 4xx)", async () => {
    const a = await signupUser(app, { email: "acceptReqA@example.com" });
    const b = await signupUser(app, { email: "acceptReqB@example.com" });

    const created = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    const friendshipId = created.body.data.friendship._id;

    const res = await request(app)
      .patch(`/api/v1/friendships/${friendshipId}/accept`)
      .set("Cookie", cookieHeader(a.cookies));

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/v1/friendships/:id/decline", () => {
  it("recipient can decline", async () => {
    const a = await signupUser(app, { email: "declineA@example.com" });
    const b = await signupUser(app, { email: "declineB@example.com" });

    const created = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    const friendshipId = created.body.data.friendship._id;

    const res = await request(app)
      .patch(`/api/v1/friendships/${friendshipId}/decline`)
      .set("Cookie", cookieHeader(b.cookies));

    expect(res.status).toBe(200);
  });

  it("requester CANNOT decline (v1 bug fixed — decline is recipient-only)", async () => {
    const a = await signupUser(app, { email: "declineReqA@example.com" });
    const b = await signupUser(app, { email: "declineReqB@example.com" });

    const created = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    const friendshipId = created.body.data.friendship._id;

    const res = await request(app)
      .patch(`/api/v1/friendships/${friendshipId}/decline`)
      .set("Cookie", cookieHeader(a.cookies));

    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/v1/friendships/:id (cancel)", () => {
  it("requester can cancel while pending", async () => {
    const a = await signupUser(app, { email: "cancelA@example.com" });
    const b = await signupUser(app, { email: "cancelB@example.com" });

    const created = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    const friendshipId = created.body.data.friendship._id;

    const res = await request(app)
      .delete(`/api/v1/friendships/${friendshipId}`)
      .set("Cookie", cookieHeader(a.cookies));

    expect(res.status).toBe(200);
  });

  it("recipient cannot cancel", async () => {
    const a = await signupUser(app, { email: "cancelRecA@example.com" });
    const b = await signupUser(app, { email: "cancelRecB@example.com" });

    const created = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    const friendshipId = created.body.data.friendship._id;

    const res = await request(app)
      .delete(`/api/v1/friendships/${friendshipId}`)
      .set("Cookie", cookieHeader(b.cookies));

    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/v1/friendships/with/:userId (unfriend)", () => {
  async function makeAcceptedFriendship() {
    const a = await signupUser(app, { email: `unfriendA${Date.now()}@example.com` });
    const b = await signupUser(app, { email: `unfriendB${Date.now()}@example.com` });
    const created = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    const friendshipId = created.body.data.friendship._id;
    await request(app)
      .patch(`/api/v1/friendships/${friendshipId}/accept`)
      .set("Cookie", cookieHeader(b.cookies));
    return { a, b, friendshipId };
  }

  it("requester side can unfriend", async () => {
    const { a, b } = await makeAcceptedFriendship();

    const res = await request(app)
      .delete(`/api/v1/friendships/with/${b.user._id}`)
      .set("Cookie", cookieHeader(a.cookies));

    expect(res.status).toBe(200);
  });

  it("recipient side can unfriend", async () => {
    const { a, b } = await makeAcceptedFriendship();

    const res = await request(app)
      .delete(`/api/v1/friendships/with/${a.user._id}`)
      .set("Cookie", cookieHeader(b.cookies));

    expect(res.status).toBe(200);
  });
});

describe("GET /api/v1/friendships/friends", () => {
  it("returns other user's public fields only", async () => {
    const a = await signupUser(app, { email: "listfriendsA@example.com" });
    const b = await signupUser(app, { email: "listfriendsB@example.com" });
    const created = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    const friendshipId = created.body.data.friendship._id;
    await request(app)
      .patch(`/api/v1/friendships/${friendshipId}/accept`)
      .set("Cookie", cookieHeader(b.cookies));

    const res = await request(app)
      .get("/api/v1/friendships/friends")
      .set("Cookie", cookieHeader(a.cookies));

    expect(res.status).toBe(200);
    expect(res.body.data.friends).toHaveLength(1);
    const friend = res.body.data.friends[0];
    expect(friend._id).toBe(b.user._id);
    expect(friend).not.toHaveProperty("password");
    expect(friend).not.toHaveProperty("email");
  });
});

describe("GET /api/v1/friendships/requests/incoming and /outgoing", () => {
  it("populates incoming and outgoing lists correctly", async () => {
    const a = await signupUser(app, { email: "reqlistA@example.com" });
    const b = await signupUser(app, { email: "reqlistB@example.com" });

    await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });

    const outgoing = await request(app)
      .get("/api/v1/friendships/requests/outgoing")
      .set("Cookie", cookieHeader(a.cookies));
    expect(outgoing.status).toBe(200);
    expect(outgoing.body.data.requests).toHaveLength(1);
    expect(outgoing.body.data.requests[0].recipient._id).toBe(b.user._id);

    const incoming = await request(app)
      .get("/api/v1/friendships/requests/incoming")
      .set("Cookie", cookieHeader(b.cookies));
    expect(incoming.status).toBe(200);
    expect(incoming.body.data.requests).toHaveLength(1);
    expect(incoming.body.data.requests[0].requester._id).toBe(a.user._id);
  });
});

describe("Re-requesting after a decline", () => {
  it("a declined pair can try again — the declined doc is reused with the new direction", async () => {
    const a = await signupUser(app, { email: "redoA@example.com" });
    const b = await signupUser(app, { email: "redoB@example.com" });

    const created = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    const friendshipId = created.body.data.friendship._id;

    const declined = await request(app)
      .patch(`/api/v1/friendships/${friendshipId}/decline`)
      .set("Cookie", cookieHeader(b.cookies));
    expect(declined.status).toBe(200);

    // B (the original recipient) changes their mind and requests A this time.
    const retryFromOtherSide = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(b.cookies))
      .send({ recipientId: a.user._id });
    expect(retryFromOtherSide.status).toBe(201);

    const friendship = retryFromOtherSide.body.data.friendship;
    // Same doc reused (unique pairKey), direction flipped, back to pending.
    expect(friendship._id).toBe(friendshipId);
    expect(friendship.status).toBe("pending");

    // A can now accept — the pair ends up friends.
    const accepted = await request(app)
      .patch(`/api/v1/friendships/${friendshipId}/accept`)
      .set("Cookie", cookieHeader(a.cookies));
    expect(accepted.status).toBe(200);
    expect(accepted.body.data.friendship.status).toBe("accepted");

    // A pending request still blocks duplicates as before.
    const duplicate = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", cookieHeader(a.cookies))
      .send({ recipientId: b.user._id });
    expect(duplicate.status).toBe(409);
  });
});
