import crypto from "node:crypto";
import type { Response } from "express";
import type { SignupInput, LoginInput, ResetPasswordInput, UpdatePasswordInput } from "@dialogue-room/shared";
import { AppError } from "../utils/appError";
import { User, type UserDocument } from "../models/user.model";
import { setAuthCookies, clearAuthCookies, verifyRefreshToken, signAccessToken, accessCookieOptions } from "../utils/tokens";
import { sendWelcome, sendPasswordReset } from "../utils/email";
import { env } from "../config/env";
import { COOKIE_NAMES } from "@dialogue-room/shared";

export async function signup(input: SignupInput, res: Response): Promise<UserDocument> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new AppError("An account with that email already exists", 409);
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    agreedToTerms: input.agreedToTerms,
  });

  setAuthCookies(res, user.id);

  sendWelcome(user).catch(console.error);

  return user;
}

export async function login(input: LoginInput, res: Response): Promise<UserDocument> {
  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user || !(await user.comparePassword(input.password))) {
    throw new AppError("Incorrect email or password", 401);
  }

  setAuthCookies(res, user.id);

  return user;
}

export function logout(res: Response): void {
  clearAuthCookies(res);
}

export async function refresh(refreshToken: string | undefined, res: Response): Promise<void> {
  if (!refreshToken) {
    throw new AppError("No refresh token provided. Please log in again.", 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
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

  const accessToken = signAccessToken(user.id);
  res.cookie(COOKIE_NAMES.ACCESS, accessToken, accessCookieOptions());
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await User.findOne({ email });
  // Always behave the same way regardless of whether the email exists —
  // no user enumeration via response timing/shape differences at the caller.
  if (!user) return;

  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.CLIENT_URL}/reset-password/${rawToken}`;

  try {
    await sendPasswordReset(user, resetUrl);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.error("Failed to send password reset email:", err);
  }
}

export async function resetPassword(
  rawToken: string,
  input: ResetPasswordInput,
  res: Response,
): Promise<UserDocument> {
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+password +passwordResetToken +passwordResetExpires");

  if (!user) {
    throw new AppError("Token is invalid or has expired", 400);
  }

  user.password = input.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  setAuthCookies(res, user.id);

  return user;
}

export async function updatePassword(
  userId: string,
  input: UpdatePasswordInput,
  res: Response,
): Promise<UserDocument> {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isCorrect = await user.comparePassword(input.currentPassword);
  if (!isCorrect) {
    throw new AppError("Your current password is incorrect", 401);
  }

  user.password = input.password;
  await user.save();

  setAuthCookies(res, user.id);

  return user;
}
