import type { Me, PublicUser } from "@dialogue-room/shared";
import type { UserDocument } from "../models/user.model";

/**
 * Single source of truth for shaping a User document for API responses.
 * Every response that includes a user MUST go through one of these two
 * helpers — never send a raw Mongoose document (v1 leaked password hashes).
 */
export function toPublicUser(user: UserDocument): PublicUser {
  return {
    _id: user._id.toString(),
    name: user.name,
    photo: user.photo,
    bio: user.bio,
    country: user.country,
    gender: user.gender,
    birthdate: user.birthdate ? user.birthdate.toISOString() : undefined,
    age: user.age,
    fluentLanguages: user.fluentLanguages,
    learningLanguages: user.learningLanguages,
    lastSeenAt: user.lastSeenAt ? user.lastSeenAt.toISOString() : undefined,
  };
}

export function toMe(user: UserDocument): Me {
  return {
    ...toPublicUser(user),
    email: user.email,
    role: user.role,
    onboardingComplete: user.onboardingComplete,
    agreedToTerms: user.agreedToTerms,
    createdAt: user.createdAt.toISOString(),
  };
}
