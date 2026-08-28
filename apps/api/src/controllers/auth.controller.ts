import type { Request, Response } from "express";
import { COOKIE_NAMES } from "@dialogue-room/shared";
import type {
  SignupInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdatePasswordInput,
} from "@dialogue-room/shared";
import { asyncHandler } from "../middlewares/asyncHandler";
import * as authService from "../services/auth.service";
import { toMe } from "../utils/sanitizeUser";
import type { AuthenticatedRequest } from "../types/express";

export const signup = asyncHandler(async (req: Request<unknown, unknown, SignupInput>, res: Response) => {
  const user = await authService.signup(req.body, res);
  res.status(201).json({ status: "success", data: { user: toMe(user) } });
});

export const login = asyncHandler(async (req: Request<unknown, unknown, LoginInput>, res: Response) => {
  const user = await authService.login(req.body, res);
  res.status(200).json({ status: "success", data: { user: toMe(user) } });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  authService.logout(res);
  res.status(200).json({ status: "success", message: "Logged out" });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[COOKIE_NAMES.REFRESH] as string | undefined;
  await authService.refresh(refreshToken, res);
  res.status(200).json({ status: "success", message: "Token refreshed" });
});

export const forgotPassword = asyncHandler(
  async (req: Request<unknown, unknown, ForgotPasswordInput>, res: Response) => {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({
      status: "success",
      message: "If that email exists, a password reset link has been sent.",
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request<{ token: string }, unknown, ResetPasswordInput>, res: Response) => {
    const user = await authService.resetPassword(req.params.token, req.body, res);
    res.status(200).json({ status: "success", data: { user: toMe(user) } });
  },
);

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const { user, body } = req as AuthenticatedRequest<object, unknown, UpdatePasswordInput>;
  const updated = await authService.updatePassword(user.id, body, res);
  res.status(200).json({ status: "success", data: { user: toMe(updated) } });
});
