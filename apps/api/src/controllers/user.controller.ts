import type { NextFunction, Request, Response } from "express";
import { updateProfileSchema, type UserDiscoveryQuery } from "@dialogue-room/shared";
import { asyncHandler } from "../middlewares/asyncHandler";
import * as userService from "../services/user.service";
import { toMe } from "../utils/sanitizeUser";
import type { AuthenticatedRequest } from "../types/express";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  res.status(200).json({ status: "success", data: { user: toMe(user) } });
});

const ARRAY_FIELDS = ["fluentLanguages", "learningLanguages"] as const;

/**
 * multipart/form-data delivers every field as a string. Array fields must be
 * JSON-parsed BEFORE zod validation, and this must run as its own middleware
 * (ahead of `validate(updateProfileSchema)`) since validate() only parses.
 */
export function coerceMultipartProfileFields(req: Request, _res: Response, next: NextFunction): void {
  for (const field of ARRAY_FIELDS) {
    const value = req.body?.[field];
    if (typeof value === "string") {
      try {
        req.body[field] = JSON.parse(value);
      } catch {
        // Leave as-is; zod will reject a non-array string with a clear error.
      }
    }
  }

  // Multer/multipart also stringifies dates; strip empty strings so
  // `.optional()` in the schema behaves instead of failing date coercion.
  if (req.body?.birthdate === "") delete req.body.birthdate;

  next();
}

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const input = updateProfileSchema.parse(req.body);
  const photoFilename = req.file?.filename;

  const updated = await userService.updateMe(user, input, photoFilename);
  res.status(200).json({ status: "success", data: { user: toMe(updated) } });
});

export const discoverUsers = asyncHandler(async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const query = req.validatedQuery as UserDiscoveryQuery;

  const result = await userService.discoverUsers(user, query);
  res.status(200).json({ status: "success", data: result });
});

export const getPublicProfile = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const profile = await userService.getPublicProfile(user, req.params.id);
  res.status(200).json({ status: "success", data: { user: profile } });
});
