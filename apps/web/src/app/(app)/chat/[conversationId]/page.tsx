"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { SOCKET_EVENTS } from "@dialogue-room/shared";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useTypingUserIds } from "@/stores/typingStore";
import { useAuthStore } from "@/stores/authStore";
import { getSocket } from "@/lib/socket";
import { api } from "@/lib/api";
import { ThreadHeader } from "@/components/chat/ThreadHeader";
import { MessageList } from "@/components/chat/MessageList";
import { Composer } from "@/components/chat/Composer";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ChatThreadPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;

  const meId = useAuthStore((state) => state.user?._id);
  const { data: conversations, isLoading: isLoadingConversations } = useConversations();
  const conversation = conversations?.find((c) => c._id === conversationId);

  const { messages, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useMessages(conversationId);
  const { sendMessage } = useChatSocket(conversationId);
  const typingUserIds = useTypingUserIds(conversationId);
  const isOtherTyping = Boolean(
    conversation && typingUserIds.includes(conversation.otherUser._id),
  );

  const markedReadRef = useRef<string | null>(null);

  // Mark the conversation read whenever it becomes active (covers messages
  // that arrived before this mount, e.g. navigating in from the list).
  useEffect(() => {
    if (!conversationId || markedReadRef.current === conversationId) return;
    markedReadRef.current = conversationId;
    api.patch(`/conversations/${conversationId}/read`).catch(() => {
      // best-effort
    });
  }, [conversationId]);

  function handleSend(content: string) {
    void sendMessage(conversationId, content);
  }

  function handleTypingStart() {
    getSocket().emit(SOCKET_EVENTS.TYPING_START, { conversationId });
  }

  function handleTypingStop() {
    getSocket().emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
  }

  if (isLoadingConversations || (isLoading && messages.length === 0)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState title="Conversation not found" description="It may have been removed." />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ThreadHeader otherUser={conversation.otherUser} isTyping={isOtherTyping} />
      <MessageList
        messages={messages}
        meId={meId ?? ""}
        otherUser={conversation.otherUser}
        hasNextPage={Boolean(hasNextPage)}
        isFetchingNextPage={isFetchingNextPage}
        onLoadOlder={() => fetchNextPage()}
      />
      <Composer onSend={handleSend} onTypingStart={handleTypingStart} onTypingStop={handleTypingStop} />
    </div>
  );
}
