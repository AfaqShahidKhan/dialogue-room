import { Router } from "express";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "@dialogue-room/shared";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import * as authController from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/signup", validate(signupSchema), authController.signup);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.post("/logout", authenticate, authController.logout);
authRouter.post("/refresh", authController.refresh);
authRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.patch(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  authController.resetPassword,
);
authRouter.patch(
  "/update-password",
  authenticate,
  validate(updatePasswordSchema),
  authController.updatePassword,
);
