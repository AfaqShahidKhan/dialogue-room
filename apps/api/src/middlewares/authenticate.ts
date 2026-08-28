import type { NextFunction, Request, Response } from "express";
import { COOKIE_NAMES } from "@dialogue-room/shared";
import { AppError } from "../utils/appError";
import { asyncHandler } from "./asyncHandler";
import { verifyAccessToken } from "../utils/tokens";
import { User } from "../models/user.model";

/**
 * Reads the dr_access cookie ONLY (no Authorization header support),
 * verifies it, loads the user, and rejects if the password changed after
 * the token was issued. Attaches the full user document to req.user.
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[COOKIE_NAMES.ACCESS] as string | undefined;
    if (!token) {
      throw new AppError("You are not logged in. Please log in to get access.", 401);
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError("Invalid or expired session. Please log in again.", 401);
    }

    const user = await User.findById(payload.sub).select("+passwordChangedAt");
    if (!user) {
      throw new AppError("The user belonging to this token no longer exists.", 401);
    }

    if (typeof payload.iat === "number" && user.changedPasswordAfter(payload.iat)) {
      throw new AppError("Password was recently changed. Please log in again.", 401);
    }

    req.user = user;
    next();
  },
);
