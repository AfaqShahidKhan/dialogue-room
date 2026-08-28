import { z } from "zod";
import { GENDERS, LIMITS } from "../constants";

const languageList = z
  .array(z.string().trim().min(1))
  .max(10, "At most 10 languages");

/**
 * PATCH /users/me — multipart-friendly: arrays may arrive as JSON strings.
 * Email, password and role are deliberately not updatable here.
 */
export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(LIMITS.NAME_MIN).max(LIMITS.NAME_MAX).optional(),
    bio: z.string().trim().max(LIMITS.BIO_MAX).optional().or(z.literal("")),
    country: z.string().trim().max(60).optional().or(z.literal("")),
    gender: z.enum(GENDERS).optional(),
    birthdate: z.coerce.date().max(new Date(), "Birthdate must be in the past").optional(),
    fluentLanguages: languageList.optional(),
    learningLanguages: languageList.optional(),
  })
  .strict();
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const userDiscoveryQuerySchema = z
  .object({
    q: z.string().trim().max(60).optional(),
    country: z.string().trim().max(60).optional(),
    gender: z.enum(GENDERS).optional(),
    maxAge: z.coerce.number().int().min(13).max(120).optional(),
    minAge: z.coerce.number().int().min(13).max(120).optional(),
    learningLanguage: z.string().trim().max(40).optional(),
    fluentLanguage: z.string().trim().max(40).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(LIMITS.DISCOVERY_PAGE_MAX)
      .default(LIMITS.DISCOVERY_PAGE_DEFAULT),
  })
  .strict();
export type UserDiscoveryQuery = z.infer<typeof userDiscoveryQuerySchema>;
