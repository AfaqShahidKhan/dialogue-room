import { useCallback, useEffect, useRef } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import { SOCKET_EVENTS } from "@dialogue-room/shared";
import type {
  ChatMessage,
  ConversationListItem,
  MessageNewPayload,
  MessageReadPayload,
  MessagesPage,
  TypingPayload,
} from "@dialogue-room/shared";
import { getSocket } from "@/lib/socket";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useTypingStore } from "@/stores/typingStore";

type MessagesInfiniteData = InfiniteData<MessagesPage>;

/** Client-only id prefix for optimistic (not-yet-persisted) messages. */
const TEMP_ID_PREFIX = "temp-";

function isOptimistic(message: ChatMessage): boolean {
  return message._id.startsWith(TEMP_ID_PREFIX);
}

function upsertMessageIntoPages(
  data: MessagesInfiniteData | undefined,
  incoming: ChatMessage,
  tempId?: string,
): MessagesInfiniteData {
  if (!data || data.pages.length === 0) {
    return {
      pages: [{ messages: [incoming], nextCursor: null }],
      pageParams: [null],
    };
  }

  // Dedupe by _id (already-persisted echo, e.g. MESSAGE_NEW arriving before
  // or after the send ack) or by tempId (optimistic entry being reconciled
  // with its persisted counterpart) — across all pages, since the ack and
  // the socket broadcast can race in either order.
  let replaced = false;
  const pages = data.pages.map((page) => {
    const messages = page.messages.map((message) => {
      const matchesById = message._id === incoming._id;
      const matchesByTempId = Boolean(tempId) && isOptimistic(message) && message.tempId === tempId;
      if (matchesById || matchesByTempId) {
        replaced = true;
        return incoming;
      }
      return message;
    });
    return { ...page, messages };
  });

  if (replaced) {
    return { ...data, pages };
  }

  // Not present anywhere yet — append to the newest page (index 0), which
  // holds the most recent messages in ascending order.
  const [newestPage, ...rest] = pages;
  const alreadyThere = newestPage.messages.some((message) => message._id === incoming._id);
  const nextNewestPage = alreadyThere
    ? newestPage
    : { ...newestPage, messages: [...newestPage.messages, incoming] };

  return { ...data, pages: [nextNewestPage, ...rest] };
}

/**
 * Real-time glue for a single active conversation thread, plus global
 * listeners (message list updates, unread counts) that must run regardless
 * of which conversation is open. Mount this once per mounted chat surface
 * with the currently active conversationId (or null when none is active).
 */
export function useChatSocket(conversationId: string | null) {
  const queryClient = useQueryClient();
  const meId = useAuthStore((state) => state.user?._id);
  const setTyping = useTypingStore((state) => state.setTyping);
  const clearTyping = useTypingStore((state) => state.clearTyping);
  const activeConversationRef = useRef(conversationId);
  activeConversationRef.current = conversationId;

  // Join/leave the conversation room as the active conversation changes.
  useEffect(() => {
    if (!conversationId) return;
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.CONVERSATION_JOIN, conversationId);
    return () => {
      socket.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    const socket = getSocket();

    const handleMessageNew = (payload: MessageNewPayload) => {
      const { message, tempId } = payload;
      const activeId = activeConversationRef.current;

      queryClient.setQueryData<MessagesInfiniteData>(
        ["messages", message.conversation],
        (data) => upsertMessageIntoPages(data, message, tempId),
      );

      queryClient.setQueryData<ConversationListItem[]>(["conversations"], (data) => {
        if (!data) return data;
        const isActive = activeId === message.conversation;
        const isMine = meId && message.sender === meId;
        const next = data.map((conversation) => {
          if (conversation._id !== message.conversation) return conversation;
          return {
            ...conversation,
            lastMessageAt: message.createdAt,
            lastMessagePreview: message.content,
            unreadCount: isActive || isMine ? conversation.unreadCount : conversation.unreadCount + 1,
          };
        });
        return next
          .slice()
          .sort((a, b) => {
            const at = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const bt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return bt - at;
          });
      });

      // If the message is for the conversation I'm actively viewing and it's
      // not from me, mark it read immediately.
      if (activeId === message.conversation && meId && message.sender !== meId) {
        api.patch(`/conversations/${activeId}/read`).catch(() => {
          // best-effort; a later read action will retry
        });
      }
    };

    const handleMessageRead = (payload: MessageReadPayload) => {
      const activeId = activeConversationRef.current;
      if (activeId !== payload.conversationId) return;
      if (payload.userId === meId) return; // my own read receipt, not relevant to bubbles

      queryClient.setQueryData<MessagesInfiniteData>(
        ["messages", payload.conversationId],
        (data) => {
          if (!data) return data;
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              messages: page.messages.map((message) =>
                message.sender === meId && !message.readAt
                  ? { ...message, readAt: payload.readAt }
                  : message,
              ),
            })),
          };
        },
      );
    };

    const handleTypingStart = (payload: TypingPayload) => {
      if (payload.userId === meId) return;
      setTyping(payload.conversationId, payload.userId);
    };

    const handleTypingStop = (payload: TypingPayload) => {
      if (payload.userId === meId) return;
      clearTyping(payload.conversationId, payload.userId);
    };

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, handleMessageNew);
    socket.on(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
    socket.on(SOCKET_EVENTS.TYPING_START, handleTypingStart);
    socket.on(SOCKET_EVENTS.TYPING_STOP, handleTypingStop);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, handleMessageNew);
      socket.off(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
      socket.off(SOCKET_EVENTS.TYPING_START, handleTypingStart);
      socket.off(SOCKET_EVENTS.TYPING_STOP, handleTypingStop);
    };
  }, [queryClient, meId, setTyping, clearTyping]);

  const sendMessage = useCallback(
    async (targetConversationId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const tempId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimisticMessage: ChatMessage = {
        _id: `${TEMP_ID_PREFIX}${tempId}`,
        conversation: targetConversationId,
        sender: meId ?? "",
        content: trimmed,
        readAt: null,
        createdAt: new Date().toISOString(),
        tempId,
      };

      queryClient.setQueryData<MessagesInfiniteData>(
        ["messages", targetConversationId],
        (data) => upsertMessageIntoPages(data, optimisticMessage, tempId),
      );
      queryClient.setQueryData<ConversationListItem[]>(["conversations"], (data) => {
        if (!data) return data;
        return data.map((conversation) =>
          conversation._id === targetConversationId
            ? {
                ...conversation,
                lastMessageAt: optimisticMessage.createdAt,
                lastMessagePreview: optimisticMessage.content,
              }
            : conversation,
        );
      });

      const socket = getSocket();

      function removeOptimistic() {
        queryClient.setQueryData<MessagesInfiniteData>(
          ["messages", targetConversationId],
          (data) => {
            if (!data) return data;
            return {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                messages: page.messages.filter((message) => message.tempId !== tempId),
              })),
            };
          },
        );
      }

      if (socket.connected) {
        socket
          .timeout(8000)
          .emit(
            SOCKET_EVENTS.MESSAGE_SEND,
            { conversationId: targetConversationId, content: trimmed, tempId },
            (
              timeoutErr: Error | null,
              ack?: { status: "success"; message: ChatMessage } | { status: "error"; message: string },
            ) => {
              if (timeoutErr || !ack || ack.status === "error") {
                removeOptimistic();
                toast.error(
                  ack && ack.status === "error" ? ack.message : "Message failed to send",
                );
                return;
              }
              queryClient.setQueryData<MessagesInfiniteData>(
                ["messages", targetConversationId],
                (data) => upsertMessageIntoPages(data, ack.message, tempId),
              );
            },
          );
      } else {
        // Fallback to REST when the socket is disconnected.
        try {
          const { message } = await api.post<{ message: ChatMessage }>(
            `/conversations/${targetConversationId}/messages`,
            { content: trimmed },
          );
          queryClient.setQueryData<MessagesInfiniteData>(
            ["messages", targetConversationId],
            (data) => upsertMessageIntoPages(data, message, tempId),
          );
        } catch (error) {
          removeOptimistic();
          toast.error(error instanceof ApiError ? error.message : "Message failed to send");
        }
      }
    },
    [queryClient, meId],
  );

  return { sendMessage };
}
