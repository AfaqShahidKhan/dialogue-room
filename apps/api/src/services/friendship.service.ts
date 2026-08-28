import { SOCKET_EVENTS, type Friendship as FriendshipDTO, type FriendshipStatus } from "@dialogue-room/shared";
import { AppError } from "../utils/appError";
import { Friendship, type FriendshipDocument } from "../models/friendship.model";
import { User, type UserDocument } from "../models/user.model";
import { toPublicUser } from "../utils/sanitizeUser";
import { emitToUser } from "../sockets/emitter";

interface FriendshipDTOInput {
  _id: unknown;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

function toFriendshipDTO(
  friendship: FriendshipDTOInput,
  requesterDoc: UserDocument,
  recipientDoc: UserDocument,
): FriendshipDTO {
  return {
    _id: String(friendship._id),
    requester: toPublicUser(requesterDoc),
    recipient: toPublicUser(recipientDoc),
    status: friendship.status,
    createdAt: friendship.createdAt.toISOString(),
    updatedAt: friendship.updatedAt.toISOString(),
  };
}

export async function sendFriendRequest(
  requester: UserDocument,
  recipientId: string,
): Promise<FriendshipDTO> {
  if (requester.id === recipientId) {
    throw new AppError("You cannot send a friend request to yourself", 400);
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new AppError("User not found", 404);
  }

  const [smaller, larger] = [requester.id, recipientId].sort();
  const existing = await Friendship.findOne({ userPair: [smaller, larger] });
  if (existing && existing.status !== "declined") {
    throw new AppError("A friendship request already exists between these users", 409);
  }

  let friendship: FriendshipDocument;
  if (existing) {
    // A declined pair may try again — reuse the doc with the new direction.
    existing.requester = requester._id;
    existing.recipient = recipient._id;
    existing.status = "pending";
    friendship = await existing.save();
  } else {
    friendship = await Friendship.create({
      requester: requester._id,
      recipient: recipient._id,
      status: "pending",
    });
  }

  const dto = toFriendshipDTO(friendship, requester, recipient);

  emitToUser(recipient.id, SOCKET_EVENTS.FRIEND_REQUEST_NEW, { friendship: dto });

  return dto;
}

async function loadFriendshipOrThrow(friendshipId: string): Promise<FriendshipDocument> {
  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) {
    throw new AppError("Friendship request not found", 404);
  }
  return friendship;
}

export async function acceptFriendRequest(
  currentUser: UserDocument,
  friendshipId: string,
): Promise<FriendshipDTO> {
  const friendship = await loadFriendshipOrThrow(friendshipId);

  if (friendship.recipient.toString() !== currentUser.id) {
    throw new AppError("Only the recipient can accept this friend request", 403);
  }
  if (friendship.status !== "pending") {
    throw new AppError("This friend request is no longer pending", 409);
  }

  friendship.status = "accepted";
  await friendship.save();

  const [requesterDoc, recipientDoc] = await Promise.all([
    User.findById(friendship.requester),
    User.findById(friendship.recipient),
  ]);
  if (!requesterDoc || !recipientDoc) {
    throw new AppError("User not found", 404);
  }

  const dto = toFriendshipDTO(friendship, requesterDoc, recipientDoc);

  emitToUser(requesterDoc.id, SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, { friendship: dto });

  return dto;
}

export async function declineFriendRequest(
  currentUser: UserDocument,
  friendshipId: string,
): Promise<void> {
  const friendship = await loadFriendshipOrThrow(friendshipId);

  if (friendship.recipient.toString() !== currentUser.id) {
    throw new AppError("Only the recipient can decline this friend request", 403);
  }
  if (friendship.status !== "pending") {
    throw new AppError("This friend request is no longer pending", 409);
  }

  friendship.status = "declined";
  await friendship.save();
}

export async function cancelFriendRequest(
  currentUser: UserDocument,
  friendshipId: string,
): Promise<void> {
  const friendship = await loadFriendshipOrThrow(friendshipId);

  if (friendship.requester.toString() !== currentUser.id) {
    throw new AppError("Only the requester can cancel this friend request", 403);
  }
  if (friendship.status !== "pending") {
    throw new AppError("This friend request is no longer pending", 409);
  }

  await friendship.deleteOne();
}

export async function unfriend(currentUser: UserDocument, otherUserId: string): Promise<void> {
  const [smaller, larger] = [currentUser.id, otherUserId].sort();
  const friendship = await Friendship.findOne({ userPair: [smaller, larger], status: "accepted" });
  if (!friendship) {
    throw new AppError("Friendship not found", 404);
  }

  await friendship.deleteOne();
}

export async function listFriends(currentUser: UserDocument) {
  const friendships = await Friendship.find({
    status: "accepted",
    $or: [{ requester: currentUser._id }, { recipient: currentUser._id }],
  }).populate<{ requester: UserDocument; recipient: UserDocument }>(["requester", "recipient"]);

  return friendships.map((friendship) => {
    const isRequester = friendship.requester.id === currentUser.id;
    const other = isRequester ? friendship.recipient : friendship.requester;
    return toPublicUser(other);
  });
}

export async function listIncomingRequests(currentUser: UserDocument): Promise<FriendshipDTO[]> {
  const friendships = await Friendship.find({
    recipient: currentUser._id,
    status: "pending",
  }).populate<{ requester: UserDocument; recipient: UserDocument }>(["requester", "recipient"]);

  return friendships.map((friendship) =>
    toFriendshipDTO(friendship, friendship.requester, friendship.recipient),
  );
}

export async function listOutgoingRequests(currentUser: UserDocument): Promise<FriendshipDTO[]> {
  const friendships = await Friendship.find({
    requester: currentUser._id,
    status: "pending",
  }).populate<{ requester: UserDocument; recipient: UserDocument }>(["requester", "recipient"]);

  return friendships.map((friendship) =>
    toFriendshipDTO(friendship, friendship.requester, friendship.recipient),
  );
}
