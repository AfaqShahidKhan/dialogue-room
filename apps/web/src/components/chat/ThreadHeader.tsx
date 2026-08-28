"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import type { PublicUser } from "@dialogue-room/shared";
import { Avatar } from "@/components/ui/Avatar";
import { TypingDots } from "@/components/chat/TypingDots";
import { usePresenceStore } from "@/stores/presenceStore";

interface ThreadHeaderProps {
  otherUser: PublicUser;
  isTyping: boolean;
}

export function ThreadHeader({ otherUser, isTyping }: ThreadHeaderProps) {
  const online = usePresenceStore((state) => state.onlineIds.has(otherUser._id));

  const statusLabel = isTyping
    ? null
    : online
      ? "Online"
      : otherUser.lastSeenAt
        ? `Last seen ${formatDistanceToNowStrict(new Date(otherUser.lastSeenAt), { addSuffix: true })}`
        : "Offline";

  return (
    <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <Link
        href="/chat"
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
        aria-label="Back to conversations"
      >
        <ArrowLeft className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </Link>
      <Avatar photo={otherUser.photo} name={otherUser.name} size={38} userId={otherUser._id} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {otherUser.name}
        </p>
        {isTyping ? (
          <TypingDots className="mt-0.5" />
        ) : (
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{statusLabel}</p>
        )}
      </div>
    </div>
  );
}
