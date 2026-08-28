import type { Server, Socket } from "socket.io";
import {
  SOCKET_EVENTS,
  socketSendMessageSchema,
  type ChatMessage,
} from "@dialogue-room/shared";
import { z } from "zod";
import { Conversation } from "../models/conversation.model";
import { Friendship } from "../models/friendship.model";
import { User } from "../models/user.model";
import * as conversationService from "../services/conversation.service";
import { emitToUser } from "./emitter";
import * as presence from "./presence";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const conversationIdPayloadSchema = z.object({ conversationId: objectIdSchema });

type SendAck = (response: { status: "success"; message: ChatMessage } | { status: "error"; message: string }) => void;

function conversationRoom(conversationId: string): string {
  return `conversation:${conversationId}`;
}

/** Ids of the user's accepted friends (either side of the friendship). */
async function acceptedFriendIds(userId: string): Promise<string[]> {
  const friendships = await Friendship.find({
    status: "accepted",
    $or: [{ requester: userId }, { recipient: userId }],
  })
    .select("requester recipient")
    .lean();

  return friendships.map((f) =>
    f.requester.toString() === userId ? f.recipient.toString() : f.requester.toString(),
  );
}

async function isConversationMember(userId: string, conversationId: string): Promise<boolean> {
  const convo = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  })
    .select("_id")
    .lean();
  return Boolean(convo);
}

/** Wire all chat + presence behavior for a freshly connected, authenticated socket. */
export function registerChatHandlers(io: Server, socket: Socket): void {
  const userId = socket.data.userId as string;

  void handleConnection(socket, userId);

  socket.on(SOCKET_EVENTS.CONVERSATION_JOIN, (conversationId: unknown) => {
    void (async () => {
      try {
        const parsed = objectIdSchema.safeParse(conversationId);
        if (!parsed.success) return;
        if (!(await isConversationMember(userId, parsed.data))) return;
        await socket.join(conversationRoom(parsed.data));
      } catch (err) {
        console.error("conversation:join error", err);
      }
    })();
  });

  socket.on(SOCKET_EVENTS.CONVERSATION_LEAVE, (conversationId: unknown) => {
    const parsed = objectIdSchema.safeParse(conversationId);
    if (!parsed.success) return;
    void socket.leave(conversationRoom(parsed.data));
  });

  socket.on(SOCKET_EVENTS.MESSAGE_SEND, (payload: unknown, ack?: SendAck) => {
    void (async () => {
      try {
        const parsed = socketSendMessageSchema.safeParse(payload);
        if (!parsed.success) {
          ack?.({ status: "error", message: "Invalid message payload" });
          return;
        }
        const { conversationId, content, tempId } = parsed.data;
        const message = await conversationService.sendMessage(userId, conversationId, content, tempId);
        ack?.({ status: "success", message });
      } catch (err) {
        console.error("message:send error", err);
        const message = err instanceof Error ? err.message : "Failed to send message";
        ack?.({ status: "error", message });
      }
    })();
  });

  socket.on(SOCKET_EVENTS.TYPING_START, (payload: unknown) => {
    relayTyping(socket, userId, SOCKET_EVENTS.TYPING_START, payload);
  });

  socket.on(SOCKET_EVENTS.TYPING_STOP, (payload: unknown) => {
    relayTyping(socket, userId, SOCKET_EVENTS.TYPING_STOP, payload);
  });

  socket.on("disconnect", () => {
    void handleDisconnect(socket, userId);
  });
}

async function handleConnection(socket: Socket, userId: string): Promise<void> {
  try {
    await socket.join(`user:${userId}`);
    const cameOnline = presence.add(userId, socket.id);
    const friendIds = await acceptedFriendIds(userId);

    if (cameOnline) {
      for (const friendId of friendIds) {
        emitToUser(friendId, SOCKET_EVENTS.PRESENCE_UPDATE, { userId, online: true });
      }
    }

    socket.emit(SOCKET_EVENTS.PRESENCE_SNAPSHOT, {
      onlineUserIds: presence.onlineAmong(friendIds),
    });
  } catch (err) {
    console.error("socket connection setup error", err);
  }
}

function relayTyping(
  socket: Socket,
  userId: string,
  event: typeof SOCKET_EVENTS.TYPING_START | typeof SOCKET_EVENTS.TYPING_STOP,
  payload: unknown,
): void {
  try {
    const parsed = conversationIdPayloadSchema.safeParse(payload);
    if (!parsed.success) return;
    const room = conversationRoom(parsed.data.conversationId);
    // Cheap authorization: only relay if this socket is actually in the room.
    if (!socket.rooms.has(room)) return;
    socket.to(room).emit(event, { conversationId: parsed.data.conversationId, userId });
  } catch (err) {
    console.error("typing relay error", err);
  }
}

async function handleDisconnect(socket: Socket, userId: string): Promise<void> {
  try {
    const wentOffline = presence.remove(userId, socket.id);
    if (!wentOffline) return;

    const now = new Date();
    await User.findByIdAndUpdate(userId, { lastSeenAt: now });

    const friendIds = await acceptedFriendIds(userId);
    for (const friendId of friendIds) {
      emitToUser(friendId, SOCKET_EVENTS.PRESENCE_UPDATE, {
        userId,
        online: false,
        lastSeenAt: now.toISOString(),
      });
    }
  } catch (err) {
    console.error("socket disconnect error", err);
  }
}
