import { z } from "zod";
import { LIMITS } from "../constants";

const email = z.string().trim().toLowerCase().email("Please provide a valid email");
const password = z
  .string()
  .min(LIMITS.PASSWORD_MIN, `Password must be at least ${LIMITS.PASSWORD_MIN} characters`)
  .max(72, "Password is too long");

const withPasswordConfirm = <T extends z.ZodRawShape>(shape: T) =>
  z
    .object(shape)
    .strict()
    .refine(
      (data) =>
        "password" in data && "passwordConfirm" in data
          ? data.password === data.passwordConfirm
          : true,
      { message: "Passwords do not match", path: ["passwordConfirm"] },
    );

export const signupSchema = withPasswordConfirm({
  name: z
    .string()
    .trim()
    .min(LIMITS.NAME_MIN, `Name must be at least ${LIMITS.NAME_MIN} characters`)
    .max(LIMITS.NAME_MAX, `Name must be at most ${LIMITS.NAME_MAX} characters`),
  email,
  password,
  passwordConfirm: z.string(),
  agreedToTerms: z
    .boolean()
    .refine((v) => v === true, { message: "You must accept the terms and conditions" }),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z
  .object({ email, password: z.string().min(1, "Password is required") })
  .strict();
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email }).strict();
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = withPasswordConfirm({
  password,
  passwordConfirm: z.string(),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updatePasswordSchema = withPasswordConfirm({
  currentPassword: z.string().min(1, "Current password is required"),
  password,
  passwordConfirm: z.string(),
});
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
