import { FilterQuery, Types } from "mongoose";
import type { DiscoveredUser, Paginated, RelationStatus, UpdateProfileInput, UserDiscoveryQuery } from "@dialogue-room/shared";
import { AppError } from "../utils/appError";
import { User, type UserAttributes, type UserDocument } from "../models/user.model";
import { Friendship } from "../models/friendship.model";
import { toPublicUser } from "../utils/sanitizeUser";

export async function updateMe(
  user: UserDocument,
  input: UpdateProfileInput,
  photoFilename: string | undefined,
): Promise<UserDocument> {
  if (input.name !== undefined) user.name = input.name;
  if (input.bio !== undefined) user.bio = input.bio;
  if (input.country !== undefined) user.country = input.country;
  if (input.gender !== undefined) user.gender = input.gender;
  if (input.birthdate !== undefined) user.birthdate = input.birthdate;
  if (input.fluentLanguages !== undefined) user.fluentLanguages = input.fluentLanguages;
  if (input.learningLanguages !== undefined) user.learningLanguages = input.learningLanguages;
  if (photoFilename) user.photo = photoFilename;

  user.onboardingComplete =
    !!user.birthdate && user.fluentLanguages.length > 0 && user.learningLanguages.length > 0;

  await user.save();
  return user;
}

function ageRangeToBirthdateRange(minAge?: number, maxAge?: number): { $gte?: Date; $lte?: Date } | undefined {
  if (minAge === undefined && maxAge === undefined) return undefined;

  const now = new Date();
  const range: { $gte?: Date; $lte?: Date } = {};

  // A person of age `maxAge` was born on or after (now - (maxAge+1) years + 1 day).
  if (maxAge !== undefined) {
    const minBirthdate = new Date(now);
    minBirthdate.setFullYear(now.getFullYear() - maxAge - 1);
    minBirthdate.setDate(minBirthdate.getDate() + 1);
    range.$gte = minBirthdate;
  }

  // A person of age `minAge` was born on or before (now - minAge years).
  if (minAge !== undefined) {
    const maxBirthdate = new Date(now);
    maxBirthdate.setFullYear(now.getFullYear() - minAge);
    range.$lte = maxBirthdate;
  }

  return range;
}

/** Batched relation-status lookup — ONE query for a page of users, no N+1. */
async function computeRelationStatuses(
  viewerId: string,
  otherUserIds: string[],
): Promise<Map<string, { status: RelationStatus; friendshipId?: string }>> {
  const result = new Map<string, { status: RelationStatus; friendshipId?: string }>();
  if (otherUserIds.length === 0) return result;

  const viewerObjectId = new Types.ObjectId(viewerId);
  const otherObjectIds = otherUserIds.map((id) => new Types.ObjectId(id));

  const friendships = await Friendship.find({
    $or: [
      { requester: viewerObjectId, recipient: { $in: otherObjectIds } },
      { recipient: viewerObjectId, requester: { $in: otherObjectIds } },
    ],
  });

  for (const friendship of friendships) {
    const requesterId = friendship.requester.toString();
    const recipientId = friendship.recipient.toString();
    const otherId = requesterId === viewerId ? recipientId : requesterId;

    if (friendship.status === "accepted") {
      result.set(otherId, { status: "friends" });
    } else if (friendship.status === "pending") {
      const status: RelationStatus = requesterId === viewerId ? "pendingOutgoing" : "pendingIncoming";
      result.set(otherId, { status, friendshipId: friendship.id });
    }
    // declined friendships are treated as "none" — fall through (not set).
  }

  return result;
}

export async function discoverUsers(
  viewer: UserDocument,
  query: UserDiscoveryQuery,
): Promise<Paginated<DiscoveredUser>> {
  const filter: FilterQuery<UserAttributes> = {
    _id: { $ne: viewer._id },
  };

  if (query.q) {
    filter.name = { $regex: query.q, $options: "i" };
  }
  if (query.country) {
    filter.country = query.country;
  }
  if (query.gender) {
    filter.gender = query.gender;
  }
  if (query.learningLanguage) {
    filter.learningLanguages = query.learningLanguage;
  }
  if (query.fluentLanguage) {
    filter.fluentLanguages = query.fluentLanguage;
  }

  const birthdateRange = ageRangeToBirthdateRange(query.minAge, query.maxAge);
  if (birthdateRange) {
    filter.birthdate = birthdateRange;
  }

  const skip = (query.page - 1) * query.limit;

  const [docs, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    User.countDocuments(filter),
  ]);

  const relationStatuses = await computeRelationStatuses(
    viewer.id,
    docs.map((doc) => doc.id),
  );

  const users: DiscoveredUser[] = docs.map((doc) => {
    const relation = relationStatuses.get(doc.id);
    return {
      ...toPublicUser(doc),
      relationStatus: relation?.status ?? "none",
      ...(relation?.friendshipId ? { friendshipId: relation.friendshipId } : {}),
    };
  });

  return {
    users,
    total,
    page: query.page,
    pages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getPublicProfile(
  viewer: UserDocument,
  targetUserId: string,
): Promise<DiscoveredUser> {
  const target = await User.findById(targetUserId);
  if (!target) {
    throw new AppError("User not found", 404);
  }

  const relationStatuses = await computeRelationStatuses(viewer.id, [target.id]);
  const relation = relationStatuses.get(target.id);

  return {
    ...toPublicUser(target),
    relationStatus: relation?.status ?? "none",
    ...(relation?.friendshipId ? { friendshipId: relation.friendshipId } : {}),
  };
}
