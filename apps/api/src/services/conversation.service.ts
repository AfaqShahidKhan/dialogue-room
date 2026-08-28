import { Types } from "mongoose";
import {
  SOCKET_EVENTS,
  LIMITS,
  type ChatMessage,
  type ConversationListItem,
  type MessagesPage,
  type PublicUser,
} from "@dialogue-room/shared";
import { AppError } from "../utils/appError";
import { Conversation, type ConversationDocument } from "../models/conversation.model";
import { Message, type MessageDocument } from "../models/message.model";
import { Friendship } from "../models/friendship.model";
import { User, type UserDocument } from "../models/user.model";
import { toPublicUser } from "../utils/sanitizeUser";
import { emitToUser, emitToConversation } from "../sockets/emitter";

/** Public-field allowlist for $lookup into users (ARCHITECTURE aggregation rule). */
const PUBLIC_USER_PROJECTION = {
  _id: 1,
  name: 1,
  photo: 1,
  country: 1,
  fluentLanguages: 1,
  learningLanguages: 1,
  gender: 1,
  birthdate: 1,
  bio: 1,
  lastSeenAt: 1,
} as const;

const PREVIEW_MAX = 120;

function sortedPair(a: string, b: string): [Types.ObjectId, Types.ObjectId] {
  const [smaller, larger] = [a, b].sort();
  return [new Types.ObjectId(smaller), new Types.ObjectId(larger)];
}

async function areAcceptedFriends(a: string, b: string): Promise<boolean> {
  const [smaller, larger] = [a, b].sort();
  const friendship = await Friendship.findOne({
    userPair: [smaller, larger],
    status: "accepted",
  }).lean();
  return Boolean(friendship);
}

function otherParticipantId(convo: ConversationDocument, meId: string): string {
  const [a, b] = convo.participants;
  return a.toString() === meId ? b.toString() : a.toString();
}

/** Shape a persisted Message document into the shared ChatMessage DTO. */
function toChatMessage(message: MessageDocument, tempId?: string): ChatMessage {
  return {
    _id: message._id.toString(),
    conversation: message.conversation.toString(),
    sender: message.sender.toString(),
    content: message.content,
    readAt: message.readAt ? message.readAt.toISOString() : null,
    createdAt: message.createdAt.toISOString(),
    ...(tempId ? { tempId } : {}),
  };
}

/**
 * Get-or-create the conversation between me and another user.
 * Only accepted friends may open a conversation. The upsert is atomic on the
 * sorted participant pair; a concurrent E11000 is resolved by re-finding.
 */
export async function getOrCreateConversation(
  meId: string,
  otherUserId: string,
): Promise<ConversationListItem> {
  if (meId === otherUserId) {
    throw new AppError("You cannot open a conversation with yourself", 400);
  }

  const other = await User.findById(otherUserId);
  if (!other) {
    throw new AppError("User not found", 404);
  }

  if (!(await areAcceptedFriends(meId, otherUserId))) {
    throw new AppError("You can only chat with your friends", 403);
  }

  const participants = sortedPair(meId, otherUserId);

  let convo: ConversationDocument;
  try {
    // findOneAndUpdate upserts bypass pre("validate") — pairKey must be set here.
    const pairKey = participants.map((id) => id.toString()).join(":");
    convo = await Conversation.findOneAndUpdate(
      { pairKey },
      { $setOnInsert: { participants, pairKey } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  } catch (err) {
    // Concurrent upsert lost the unique-index race — the doc now exists.
    if (err && typeof err === "object" && "code" in err && (err as { code?: number }).code === 11000) {
      const existing = await Conversation.findOne({ participants });
      if (!existing) throw err;
      convo = existing;
    } else {
      throw err;
    }
  }

  return toConversationListItem(convo, meId, other, 0);
}

/** Build a ConversationListItem given a resolved other-user doc + unread count. */
function toConversationListItem(
  convo: ConversationDocument,
  meId: string,
  otherUser: UserDocument,
  unreadCount: number,
): ConversationListItem {
  return {
    _id: convo._id.toString(),
    otherUser: toPublicUser(otherUser),
    lastMessageAt: convo.lastMessageAt ? convo.lastMessageAt.toISOString() : null,
    lastMessagePreview: convo.lastMessagePreview ?? null,
    unreadCount,
  };
}

interface ConversationAggRow {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  readState: Record<string, Date> | Map<string, Date> | null;
  otherUser: (PublicUser & { _id: Types.ObjectId }) | null;
  unreadCount: number;
}

/**
 * List my conversations, newest-activity first, each with the other participant's
 * public fields and an unread count (messages from the other user newer than my
 * last-read timestamp). One aggregation, projected to the public field allowlist.
 */
export async function listConversations(meId: string): Promise<ConversationListItem[]> {
  const meObjectId = new Types.ObjectId(meId);

  const rows = await Conversation.aggregate<ConversationAggRow>([
    { $match: { participants: meObjectId } },
    { $sort: { lastMessageAt: -1, _id: -1 } },
    {
      $addFields: {
        otherUserId: {
          $first: {
            $filter: {
              input: "$participants",
              as: "p",
              cond: { $ne: ["$$p", meObjectId] },
            },
          },
        },
        myLastRead: {
          $getField: { field: meId, input: "$readState" },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { otherId: "$otherUserId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$otherId"] } } },
          { $project: PUBLIC_USER_PROJECTION },
        ],
        as: "otherUser",
      },
    },
    { $addFields: { otherUser: { $first: "$otherUser" } } },
    {
      $lookup: {
        from: "messages",
        let: { convoId: "$_id", otherId: "$otherUserId", lastRead: "$myLastRead" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$conversation", "$$convoId"] },
                  { $eq: ["$sender", "$$otherId"] },
                  {
                    $or: [
                      { $eq: ["$$lastRead", null] },
                      { $gt: ["$createdAt", "$$lastRead"] },
                    ],
                  },
                ],
              },
            },
          },
          { $count: "count" },
        ],
        as: "unread",
      },
    },
    {
      $addFields: {
        unreadCount: { $ifNull: [{ $first: "$unread.count" }, 0] },
      },
    },
    {
      $project: {
        participants: 1,
        lastMessageAt: 1,
        lastMessagePreview: 1,
        otherUser: 1,
        unreadCount: 1,
      },
    },
  ]);

  return rows
    .filter((row): row is ConversationAggRow & { otherUser: NonNullable<ConversationAggRow["otherUser"]> } =>
      row.otherUser !== null,
    )
    .map((row) => {
      const { _id, ...publicFields } = row.otherUser;
      const otherUser: PublicUser = {
        ...publicFields,
        _id: _id.toString(),
        birthdate: publicFields.birthdate
          ? new Date(publicFields.birthdate).toISOString()
          : undefined,
        lastSeenAt: publicFields.lastSeenAt
          ? new Date(publicFields.lastSeenAt).toISOString()
          : undefined,
      };
      return {
        _id: row._id.toString(),
        otherUser,
        lastMessageAt: row.lastMessageAt ? new Date(row.lastMessageAt).toISOString() : null,
        lastMessagePreview: row.lastMessagePreview ?? null,
        unreadCount: row.unreadCount,
      };
    });
}

/** Load a conversation and assert the given user is a participant. */
async function loadMembershipOrThrow(
  meId: string,
  conversationId: string,
): Promise<ConversationDocument> {
  const convo = await Conversation.findById(conversationId);
  if (!convo) {
    throw new AppError("Conversation not found", 404);
  }
  const isMember = convo.participants.some((p) => p.toString() === meId);
  if (!isMember) {
    throw new AppError("You are not a participant of this conversation", 403);
  }
  return convo;
}

/**
 * Cursor-paginated messages, returned chronological-ascending.
 * `before` is a message _id; older messages are fetched. nextCursor is the
 * oldest returned _id when a full page came back, else null.
 */
export async function getMessages(
  meId: string,
  conversationId: string,
  opts: { before?: string; limit?: number },
): Promise<MessagesPage> {
  await loadMembershipOrThrow(meId, conversationId);

  const limit = opts.limit ?? LIMITS.MESSAGES_PAGE_DEFAULT;

  const filter: Record<string, unknown> = { conversation: new Types.ObjectId(conversationId) };
  if (opts.before) {
    filter._id = { $lt: new Types.ObjectId(opts.before) };
  }

  // Newest-first from the cursor, then reverse to chronological-ascending.
  const docs = await Message.find(filter).sort({ _id: -1 }).limit(limit);

  const fullPage = docs.length === limit;
  const oldest = docs[docs.length - 1];
  const nextCursor = fullPage && oldest ? oldest._id.toString() : null;

  const messages = docs
    .slice()
    .reverse()
    .map((doc) => toChatMessage(doc));

  return { messages, nextCursor };
}

/**
 * Persist a message (shared by REST + socket paths), update conversation
 * activity, mark the sender's own read state to now, and broadcast MESSAGE_NEW
 * to the conversation room AND both participants' user rooms.
 */
export async function sendMessage(
  meId: string,
  conversationId: string,
  content: string,
  tempId?: string,
): Promise<ChatMessage> {
  const convo = await loadMembershipOrThrow(meId, conversationId);

  const message = await Message.create({
    conversation: convo._id,
    sender: new Types.ObjectId(meId),
    content,
    readAt: null,
  });

  const preview = content.slice(0, PREVIEW_MAX);
  convo.lastMessageAt = message.createdAt;
  convo.lastMessagePreview = preview;
  convo.readState.set(meId, new Date());
  await convo.save();

  const dto = toChatMessage(message, tempId);

  const payload = { message: dto, ...(tempId ? { tempId } : {}) };
  emitToConversation(conversationId, SOCKET_EVENTS.MESSAGE_NEW, payload);
  for (const participant of convo.participants) {
    emitToUser(participant.toString(), SOCKET_EVENTS.MESSAGE_NEW, payload);
  }

  return dto;
}

/**
 * Mark a conversation read for me: bump my readState to now, flip readAt on
 * unread messages from the other participant, and broadcast MESSAGE_READ.
 */
export async function markConversationRead(
  meId: string,
  conversationId: string,
): Promise<{ conversationId: string; userId: string; readAt: string }> {
  const convo = await loadMembershipOrThrow(meId, conversationId);
  const otherId = otherParticipantId(convo, meId);

  const now = new Date();
  convo.readState.set(meId, now);
  await convo.save();

  await Message.updateMany(
    { conversation: convo._id, sender: new Types.ObjectId(otherId), readAt: null },
    { $set: { readAt: now } },
  );

  const payload = { conversationId, userId: meId, readAt: now.toISOString() };
  emitToConversation(conversationId, SOCKET_EVENTS.MESSAGE_READ, payload);

  return payload;
}
