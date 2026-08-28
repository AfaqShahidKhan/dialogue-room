"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { isSameDay } from "date-fns";
import type { ChatMessage, PublicUser } from "@dialogue-room/shared";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { DateSeparator } from "@/components/chat/DateSeparator";
import { NewMessagesChip } from "@/components/chat/NewMessagesChip";
import { Spinner } from "@/components/ui/Spinner";

const GROUP_GAP_MS = 5 * 60 * 1000; // messages within 5 min from the same sender group together
const NEAR_BOTTOM_THRESHOLD = 120;

interface MessageListProps {
  messages: ChatMessage[];
  meId: string;
  otherUser: PublicUser;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadOlder: () => void;
}

export function MessageList({
  messages,
  meId,
  otherUser,
  hasNextPage,
  isFetchingNextPage,
  onLoadOlder,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const prevMessageCountRef = useRef(messages.length);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const isNearBottomRef = useRef(true);

  // IntersectionObserver sentinel at the top triggers loading older pages.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          prevScrollHeightRef.current = root.scrollHeight;
          onLoadOlder();
        }
      },
      { root, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadOlder]);

  // Preserve scroll position when older messages are prepended.
  useLayoutEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    if (prevScrollHeightRef.current !== null) {
      const delta = root.scrollHeight - prevScrollHeightRef.current;
      root.scrollTop += delta;
      prevScrollHeightRef.current = null;
      prevMessageCountRef.current = messages.length;
      return;
    }

    const grew = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (grew) {
      if (isNearBottomRef.current) {
        root.scrollTop = root.scrollHeight;
        setShowJumpToBottom(false);
      } else {
        setShowJumpToBottom(true);
      }
    }
  }, [messages]);

  // Jump to bottom on first mount of a conversation.
  useEffect(() => {
    const root = scrollRef.current;
    if (root) root.scrollTop = root.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUser._id]);

  function handleScroll() {
    const root = scrollRef.current;
    if (!root) return;
    const distanceFromBottom = root.scrollHeight - root.scrollTop - root.clientHeight;
    isNearBottomRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD;
    if (isNearBottomRef.current) setShowJumpToBottom(false);
  }

  function scrollToBottom() {
    const root = scrollRef.current;
    if (!root) return;
    root.scrollTo({ top: root.scrollHeight, behavior: "smooth" });
    setShowJumpToBottom(false);
  }

  // Determine the id of my own last message overall (for the read receipt).
  const myLastMessageId = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === meId) return messages[i]._id;
    }
    return null;
  })();

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-thin h-full overflow-y-auto px-4 py-3"
      >
        <div ref={sentinelRef} className="flex justify-center py-2">
          {isFetchingNextPage && <Spinner size={18} />}
        </div>

        {messages.map((message, index) => {
          const prev = messages[index - 1];
          const next = messages[index + 1];
          const createdAt = new Date(message.createdAt);

          const showDateSeparator = !prev || !isSameDay(createdAt, new Date(prev.createdAt));

          const groupStart =
            showDateSeparator ||
            !prev ||
            prev.sender !== message.sender ||
            createdAt.getTime() - new Date(prev.createdAt).getTime() > GROUP_GAP_MS;

          const groupEnd =
            !next ||
            next.sender !== message.sender ||
            !isSameDay(createdAt, new Date(next.createdAt)) ||
            new Date(next.createdAt).getTime() - createdAt.getTime() > GROUP_GAP_MS;

          const isMine = message.sender === meId;
          const showReadReceipt = isMine && message._id === myLastMessageId && Boolean(message.readAt);

          return (
            <div key={message._id || message.tempId}>
              {showDateSeparator && <DateSeparator date={createdAt} />}
              <MessageBubble
                message={message}
                isMine={isMine}
                otherUser={otherUser}
                isGroupStart={groupStart}
                isGroupEnd={groupEnd}
                showReadReceipt={showReadReceipt}
              />
            </div>
          );
        })}
      </div>

      {showJumpToBottom && <NewMessagesChip onClick={scrollToBottom} />}
    </div>
  );
}
