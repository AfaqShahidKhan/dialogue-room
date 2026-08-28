import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import type { Express } from "express";
import request from "supertest";
import {
  startMemoryDb,
  stopMemoryDb,
  clearDatabase,
  buildApp,
  signupUser,
  extractCookie,
  extractSetCookieArray,
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

describe("POST /api/v1/auth/signup", () => {
  it("returns 201, sets dr_access + dr_refresh cookies with correct paths, and leaks no sensitive keys", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      name: "Alice Example",
      email: "alice@example.com",
      password: "Password123!",
      passwordConfirm: "Password123!",
      agreedToTerms: true,
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.user.email).toBe("alice@example.com");

    const cookies = extractSetCookieArray(res);
    const accessCookie = cookies.find((c) => c.startsWith("dr_access="));
    const refreshCookie = cookies.find((c) => c.startsWith("dr_refresh="));
    expect(accessCookie).toBeDefined();
    expect(refreshCookie).toBeDefined();
    expect(accessCookie).toMatch(/HttpOnly/i);
    expect(refreshCookie).toMatch(/HttpOnly/i);
    expect(accessCookie).toMatch(/Path=\//i);
    expect(accessCookie).not.toMatch(/Path=\/api\/v1\/auth/i);
    expect(refreshCookie).toMatch(/Path=\/api\/v1\/auth/i);

    const forbidden = findForbiddenKeys(res.body);
    expect(forbidden).toEqual([]);
  });

  it("rejects a duplicate email with 409", async () => {
    const email = "dup@example.com";
    await signupUser(app, { email });

    const res = await request(app).post("/api/v1/auth/signup").send({
      name: "Someone Else",
      email,
      password: "Password123!",
      passwordConfirm: "Password123!",
      agreedToTerms: true,
    });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe("fail");
  });

  it("rejects a weak password (<8 chars) with 400", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      name: "Weak Pass",
      email: "weak@example.com",
      password: "short",
      passwordConfirm: "short",
      agreedToTerms: true,
    });

    expect(res.status).toBe(400);
  });

  it("rejects a missing agreedToTerms with 400", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      name: "No Terms",
      email: "noterms@example.com",
      password: "Password123!",
      passwordConfirm: "Password123!",
    });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/auth/login", () => {
  it("logs in with correct credentials", async () => {
    const email = "login@example.com";
    const password = "Password123!";
    await signupUser(app, { email, password });

    const res = await request(app).post("/api/v1/auth/login").send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email);
    const cookies = extractSetCookieArray(res);
    expect(cookies.some((c) => c.startsWith("dr_access="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("dr_refresh="))).toBe(true);
  });

  it("rejects wrong password with 401", async () => {
    const email = "wrongpass@example.com";
    await signupUser(app, { email, password: "Password123!" });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: "TotallyWrong1!" });

    expect(res.status).toBe(401);
  });

  it("rejects unknown email with 401", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nobody@example.com", password: "Password123!" });

    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("clears both auth cookies", async () => {
    const { cookies } = await signupUser(app);

    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", cookieHeader(cookies));

    expect(res.status).toBe(200);
    const clearCookies = extractSetCookieArray(res);
    const access = clearCookies.find((c) => c.startsWith("dr_access="));
    const refresh = clearCookies.find((c) => c.startsWith("dr_refresh="));
    expect(access).toBeDefined();
    expect(refresh).toBeDefined();
    // clearCookie sets value to empty + an expiry in the past.
    expect(access).toMatch(/dr_access=;/);
    expect(refresh).toMatch(/dr_refresh=;/);
  });
});

describe("POST /api/v1/auth/refresh", () => {
  it("issues a fresh access cookie from a valid refresh cookie", async () => {
    const { cookies } = await signupUser(app);
    const refreshCookieValue = extractCookie(
      { headers: { "set-cookie": cookies } } as unknown as request.Response,
      "dr_refresh",
    );
    expect(refreshCookieValue).toBeDefined();

    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", `dr_refresh=${refreshCookieValue}`);

    expect(res.status).toBe(200);
    const newCookies = extractSetCookieArray(res);
    expect(newCookies.some((c) => c.startsWith("dr_access="))).toBe(true);
  });

  it("rejects garbage refresh cookie with 401", async () => {
    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", "dr_refresh=garbage.token.value");

    expect(res.status).toBe(401);
  });

  it("rejects absent refresh cookie with 401", async () => {
    const res = await request(app).post("/api/v1/auth/refresh");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/v1/auth/update-password", () => {
  it("rejects wrong currentPassword with 401 (v1 security bug fixed)", async () => {
    const { cookies } = await signupUser(app, { password: "Password123!" });

    const res = await request(app)
      .patch("/api/v1/auth/update-password")
      .set("Cookie", cookieHeader(cookies))
      .send({
        currentPassword: "WrongOldPassword1!",
        password: "NewPassword456!",
        passwordConfirm: "NewPassword456!",
      });

    expect(res.status).toBe(401);
  });

  it("updates password with correct currentPassword, and old password stops working while new one works", async () => {
    const email = "updatepw@example.com";
    const oldPassword = "Password123!";
    const newPassword = "NewPassword456!";
    const { cookies } = await signupUser(app, { email, password: oldPassword });

    const res = await request(app)
      .patch("/api/v1/auth/update-password")
      .set("Cookie", cookieHeader(cookies))
      .send({
        currentPassword: oldPassword,
        password: newPassword,
        passwordConfirm: newPassword,
      });

    expect(res.status).toBe(200);

    const oldLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: oldPassword });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: newPassword });
    expect(newLogin.status).toBe(200);
  });
});

describe("POST /api/v1/auth/forgot-password", () => {
  it("responds 200 for an unknown email (no enumeration)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "unknown-nobody@example.com" });

    expect(res.status).toBe(200);
  });

  it("responds 200 for a known email and sets passwordResetToken in the DB", async () => {
    const email = "forgot@example.com";
    await signupUser(app, { email });

    const res = await request(app).post("/api/v1/auth/forgot-password").send({ email });
    expect(res.status).toBe(200);

    const { User } = await import("../src/models/user.model");
    const user = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpires");
    expect(user?.passwordResetToken).toBeTruthy();
    expect(user?.passwordResetExpires).toBeTruthy();
  });
});

describe("PATCH /api/v1/auth/reset-password/:token", () => {
  it("resets the password with a valid raw token, logs the user in, and invalidates the old password", async () => {
    const email = "reset@example.com";
    const oldPassword = "Password123!";
    const newPassword = "BrandNewPass789!";
    await signupUser(app, { email, password: oldPassword });

    const { User } = await import("../src/models/user.model");
    const user = await User.findOne({ email });
    expect(user).toBeTruthy();
    const rawToken = user!.createPasswordResetToken();
    await user!.save({ validateBeforeSave: false });

    const res = await request(app)
      .patch(`/api/v1/auth/reset-password/${rawToken}`)
      .send({ password: newPassword, passwordConfirm: newPassword });

    expect(res.status).toBe(200);
    const cookies = extractSetCookieArray(res);
    expect(cookies.some((c) => c.startsWith("dr_access="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("dr_refresh="))).toBe(true);

    const oldLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: oldPassword });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: newPassword });
    expect(newLogin.status).toBe(200);
  });

  it("rejects an invalid token with 400", async () => {
    const res = await request(app)
      .patch("/api/v1/auth/reset-password/not-a-real-token")
      .send({ password: "SomePassword123!", passwordConfirm: "SomePassword123!" });

    expect(res.status).toBe(400);
  });
});

describe("Protected routes without auth cookie", () => {
  it("GET /api/v1/users/me returns 401 without a cookie", async () => {
    const res = await request(app).get("/api/v1/users/me");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/friendships/friends returns 401 without a cookie", async () => {
    const res = await request(app).get("/api/v1/friendships/friends");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/conversations returns 401 without a cookie", async () => {
    const res = await request(app).get("/api/v1/conversations");
    expect(res.status).toBe(401);
  });
});
