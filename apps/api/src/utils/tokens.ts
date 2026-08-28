import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";
import { COOKIE_NAMES } from "@dialogue-room/shared";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string;
}

export interface RefreshTokenPayload {
  sub: string;
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies AccessTokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies RefreshTokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload & jwt.JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload & jwt.JwtPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload & jwt.JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload & jwt.JwtPayload;
}

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
};

export function accessCookieOptions(): CookieOptions {
  return {
    ...baseCookieOptions,
    path: "/",
    maxAge: 15 * 60 * 1000,
  };
}

export function refreshCookieOptions(): CookieOptions {
  return {
    ...baseCookieOptions,
    path: "/api/v1/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}

/** Sets both auth cookies on the response. */
export function setAuthCookies(
  res: import("express").Response,
  userId: string,
): { accessToken: string; refreshToken: string } {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  res.cookie(COOKIE_NAMES.ACCESS, accessToken, accessCookieOptions());
  res.cookie(COOKIE_NAMES.REFRESH, refreshToken, refreshCookieOptions());
  return { accessToken, refreshToken };
}

/** Clears both auth cookies (must mirror the same path options used to set them). */
export function clearAuthCookies(res: import("express").Response): void {
  res.clearCookie(COOKIE_NAMES.ACCESS, { ...baseCookieOptions, path: "/" });
  res.clearCookie(COOKIE_NAMES.REFRESH, { ...baseCookieOptions, path: "/api/v1/auth" });
}
