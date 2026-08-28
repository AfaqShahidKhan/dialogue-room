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

/** Helper: sign up + log in a user, patch their profile with onboarding fields, return cookie header + userId. */
async function createUser(overrides: Parameters<typeof signupUser>[1] = {}) {
  const { user, cookies } = await signupUser(app, overrides);
  return { userId: user._id as string, cookies, header: cookieHeader(cookies) };
}

function yearsAgo(years: number, monthOffsetDays = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() + monthOffsetDays);
  return d.toISOString().slice(0, 10);
}

describe("GET /api/v1/users/me", () => {
  it("returns the Me shape", async () => {
    const { header } = await createUser({ email: "me1@example.com" });
    const res = await request(app).get("/api/v1/users/me").set("Cookie", header);

    expect(res.status).toBe(200);
    const user = res.body.data.user;
    expect(user).toMatchObject({
      email: "me1@example.com",
      onboardingComplete: false,
      agreedToTerms: true,
      role: "user",
    });
    expect(typeof user._id).toBe("string");
    expect(Array.isArray(user.fluentLanguages)).toBe(true);
    expect(Array.isArray(user.learningLanguages)).toBe(true);
    expect(user.createdAt).toBeDefined();
  });
});

describe("PATCH /api/v1/users/me", () => {
  it("updates name/bio/languages", async () => {
    const { header } = await createUser({ email: "patch1@example.com" });
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Cookie", header)
      .send({
        name: "New Name Here",
        bio: "Hello, I love languages.",
        fluentLanguages: ["English", "Spanish"],
        learningLanguages: ["Japanese"],
      });

    expect(res.status).toBe(200);
    const user = res.body.data.user;
    expect(user.name).toBe("New Name Here");
    expect(user.bio).toBe("Hello, I love languages.");
    expect(user.fluentLanguages).toEqual(["English", "Spanish"]);
    expect(user.learningLanguages).toEqual(["Japanese"]);
  });

  it("sets onboardingComplete true once birthdate + fluent + learning languages are all present", async () => {
    const { header } = await createUser({ email: "onboard1@example.com" });

    const partial = await request(app)
      .patch("/api/v1/users/me")
      .set("Cookie", header)
      .send({ fluentLanguages: ["English"] });
    expect(partial.status).toBe(200);
    expect(partial.body.data.user.onboardingComplete).toBe(false);

    const complete = await request(app)
      .patch("/api/v1/users/me")
      .set("Cookie", header)
      .send({
        birthdate: yearsAgo(25),
        fluentLanguages: ["English"],
        learningLanguages: ["French"],
      });
    expect(complete.status).toBe(200);
    expect(complete.body.data.user.onboardingComplete).toBe(true);
  });

  it("rejects attempts to set email via this endpoint with 400", async () => {
    const { header } = await createUser({ email: "noemailchange@example.com" });
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Cookie", header)
      .send({ email: "hacked@example.com" });
    expect(res.status).toBe(400);
  });

  it("rejects attempts to set role via this endpoint with 400", async () => {
    const { header } = await createUser({ email: "norolechange@example.com" });
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Cookie", header)
      .send({ role: "admin" });
    expect(res.status).toBe(400);
  });

  it("rejects attempts to set password via this endpoint with 400", async () => {
    const { header } = await createUser({ email: "nopasswordchange@example.com" });
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Cookie", header)
      .send({ password: "NewPassword123!" });
    expect(res.status).toBe(400);
  });

  it("rejects a truly unknown field with 400", async () => {
    const { header } = await createUser({ email: "unknownfield@example.com" });
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Cookie", header)
      .send({ somethingTotallyMadeUp: "value" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/users (discovery)", () => {
  it("excludes the requesting user themselves", async () => {
    const { header, userId } = await createUser({ email: "self1@example.com" });
    await createUser({ email: "other1@example.com" });

    const res = await request(app).get("/api/v1/users").set("Cookie", header);
    expect(res.status).toBe(200);
    const ids = res.body.data.users.map((u: { _id: string }) => u._id);
    expect(ids).not.toContain(userId);
  });

  it("filters by country/gender/learningLanguage/fluentLanguage/q", async () => {
    const { header } = await createUser({ email: "viewer1@example.com" });

    const candidates = [
      { email: "a1@example.com", country: "Oman", gender: "male", fluent: ["Arabic"], learning: ["English"], name: "Zaid Al Farsi" },
      { email: "a2@example.com", country: "Oman", gender: "female", fluent: ["English"], learning: ["Arabic"], name: "Layla Salim" },
      { email: "a3@example.com", country: "Japan", gender: "male", fluent: ["Japanese"], learning: ["English"], name: "Kenji Sato" },
    ];

    for (const c of candidates) {
      const { header: h } = await createUser({ email: c.email, name: c.name });
      const patchRes = await request(app).patch("/api/v1/users/me").set("Cookie", h).send({
        country: c.country,
        gender: c.gender,
        fluentLanguages: c.fluent,
        learningLanguages: c.learning,
      });
      expect(patchRes.status).toBe(200);
    }

    const byCountry = await request(app).get("/api/v1/users?country=Oman").set("Cookie", header);
    expect(byCountry.status).toBe(200);
    expect(byCountry.body.data.users).toHaveLength(2);

    const byGender = await request(app).get("/api/v1/users?gender=female").set("Cookie", header);
    expect(byGender.body.data.users).toHaveLength(1);
    expect(byGender.body.data.users[0].name).toBe("Layla Salim");

    const byLearning = await request(app)
      .get("/api/v1/users?learningLanguage=English")
      .set("Cookie", header);
    expect(byLearning.body.data.users.map((u: { name: string }) => u.name).sort()).toEqual(
      ["Kenji Sato", "Zaid Al Farsi"].sort(),
    );

    const byFluent = await request(app)
      .get("/api/v1/users?fluentLanguage=Japanese")
      .set("Cookie", header);
    expect(byFluent.body.data.users).toHaveLength(1);
    expect(byFluent.body.data.users[0].name).toBe("Kenji Sato");

    const byQ = await request(app).get("/api/v1/users?q=Layla").set("Cookie", header);
    expect(byQ.body.data.users).toHaveLength(1);
    expect(byQ.body.data.users[0].name).toBe("Layla Salim");
  });

  it("filters minAge/maxAge correctly with exact boundary birthdates", async () => {
    const { header } = await createUser({ email: "ageviewer@example.com" });

    // Exactly 20, 25, 30 years old today.
    const ages = [20, 25, 30];
    for (const age of ages) {
      const { header: h } = await createUser({ email: `age${age}@example.com`, name: `Age${age} Person` });
      const patchRes = await request(app)
        .patch("/api/v1/users/me")
        .set("Cookie", h)
        .send({ birthdate: yearsAgo(age) });
      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.user.age).toBe(age);
    }

    const minOnly = await request(app).get("/api/v1/users?minAge=25").set("Cookie", header);
    const minNames = minOnly.body.data.users.map((u: { name: string }) => u.name).sort();
    expect(minNames).toEqual(["Age25 Person", "Age30 Person"]);

    const maxOnly = await request(app).get("/api/v1/users?maxAge=25").set("Cookie", header);
    const maxNames = maxOnly.body.data.users.map((u: { name: string }) => u.name).sort();
    expect(maxNames).toEqual(["Age20 Person", "Age25 Person"]);

    const range = await request(app)
      .get("/api/v1/users?minAge=20&maxAge=25")
      .set("Cookie", header);
    const rangeNames = range.body.data.users.map((u: { name: string }) => u.name).sort();
    expect(rangeNames).toEqual(["Age20 Person", "Age25 Person"]);
  });

  it("pagination total/pages numbers are correct", async () => {
    const { header } = await createUser({ email: "pageviewer@example.com" });
    for (let i = 0; i < 5; i++) {
      await createUser({ email: `pageuser${i}@example.com` });
    }

    const res = await request(app).get("/api/v1/users?limit=2&page=1").set("Cookie", header);
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(5);
    expect(res.body.data.pages).toBe(3);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.users).toHaveLength(2);

    const lastPage = await request(app).get("/api/v1/users?limit=2&page=3").set("Cookie", header);
    expect(lastPage.body.data.users).toHaveLength(1);
  });

  it("relationStatus is correct for none/pendingOutgoing/pendingIncoming/friends", async () => {
    const viewer = await createUser({ email: "relviewer@example.com" });
    const strangerUser = await createUser({ email: "stranger@example.com" });
    const outgoingTarget = await createUser({ email: "outgoingtarget@example.com" });
    const incomingSource = await createUser({ email: "incomingsource@example.com" });
    const friendUser = await createUser({ email: "frienduser@example.com" });

    // viewer -> outgoingTarget: pending (viewer is requester => pendingOutgoing from viewer's perspective)
    const sendOutgoing = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", viewer.header)
      .send({ recipientId: outgoingTarget.userId });
    expect(sendOutgoing.status).toBe(201);

    // incomingSource -> viewer: pending (viewer is recipient => pendingIncoming from viewer's perspective)
    const sendIncoming = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", incomingSource.header)
      .send({ recipientId: viewer.userId });
    expect(sendIncoming.status).toBe(201);

    // viewer <-> friendUser: accepted
    const sendFriend = await request(app)
      .post("/api/v1/friendships")
      .set("Cookie", viewer.header)
      .send({ recipientId: friendUser.userId });
    expect(sendFriend.status).toBe(201);
    const friendshipId = sendFriend.body.data.friendship._id;
    const acceptFriend = await request(app)
      .patch(`/api/v1/friendships/${friendshipId}/accept`)
      .set("Cookie", friendUser.header);
    expect(acceptFriend.status).toBe(200);

    const res = await request(app).get("/api/v1/users?limit=50").set("Cookie", viewer.header);
    expect(res.status).toBe(200);
    const byId = new Map<string, { relationStatus: string; friendshipId?: string }>(
      res.body.data.users.map((u: { _id: string; relationStatus: string; friendshipId?: string }) => [
        u._id,
        { relationStatus: u.relationStatus, friendshipId: u.friendshipId },
      ]),
    );

    function entryFor(userId: string): { relationStatus: string; friendshipId?: string } {
      const entry = byId.get(userId);
      expect(entry).toBeDefined();
      return entry as { relationStatus: string; friendshipId?: string };
    }

    expect(entryFor(strangerUser.userId).relationStatus).toBe("none");
    expect(entryFor(strangerUser.userId).friendshipId).toBeUndefined();

    expect(entryFor(outgoingTarget.userId).relationStatus).toBe("pendingOutgoing");
    expect(entryFor(outgoingTarget.userId).friendshipId).toBeDefined();

    expect(entryFor(incomingSource.userId).relationStatus).toBe("pendingIncoming");
    expect(entryFor(incomingSource.userId).friendshipId).toBeDefined();

    expect(entryFor(friendUser.userId).relationStatus).toBe("friends");
    expect(entryFor(friendUser.userId).friendshipId).toBeUndefined();
  });

  it("results contain no password-ish fields anywhere", async () => {
    const { header } = await createUser({ email: "sanitycheck@example.com" });
    await createUser({ email: "othersanitycheck@example.com" });

    const res = await request(app).get("/api/v1/users").set("Cookie", header);
    expect(res.status).toBe(200);
    expect(findForbiddenKeys(res.body)).toEqual([]);
  });
});

describe("GET /api/v1/users/:id", () => {
  it("returns the public profile shape with correct relationStatus", async () => {
    const viewer = await createUser({ email: "profileviewer@example.com" });
    const target = await createUser({ email: "profiletarget@example.com" });

    const res = await request(app)
      .get(`/api/v1/users/${target.userId}`)
      .set("Cookie", viewer.header);

    expect(res.status).toBe(200);
    expect(res.body.data.user._id).toBe(target.userId);
    expect(res.body.data.user.relationStatus).toBe("none");
    expect(findForbiddenKeys(res.body)).toEqual([]);
  });

  it("returns 404 for an unknown id", async () => {
    const { header } = await createUser({ email: "unknownprofile@example.com" });
    const res = await request(app)
      .get("/api/v1/users/000000000000000000000000")
      .set("Cookie", header);
    expect(res.status).toBe(404);
  });
});
