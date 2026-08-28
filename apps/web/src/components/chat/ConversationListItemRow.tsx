"use client";

import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import type { ConversationListItem } from "@dialogue-room/shared";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { usePresenceStore } from "@/stores/presenceStore";

interface ConversationListItemRowProps {
  conversation: ConversationListItem;
  active: boolean;
  onClick?: () => void;
}

export function ConversationListItemRow({ conversation, active, onClick }: ConversationListItemRowProps) {
  const { otherUser } = conversation;
  const online = usePresenceStore((state) => state.onlineIds.has(otherUser._id));

  return (
    <Link
      href={`/chat/${conversation._id}`}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
        active
          ? "bg-brand-50 dark:bg-brand-950"
          : "hover:bg-slate-100 dark:hover:bg-slate-800/50",
      )}
    >
      <Avatar photo={otherUser.photo} name={otherUser.name} size={44} userId={otherUser._id} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm font-medium",
              active ? "text-brand-700 dark:text-brand-300" : "text-slate-900 dark:text-slate-100",
            )}
          >
            {otherUser.name}
          </p>
          {conversation.lastMessageAt && (
            <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">
              {formatDistanceToNowStrict(new Date(conversation.lastMessageAt), { addSuffix: false })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {conversation.lastMessagePreview ??
              (online ? "Online" : "Say hello to start chatting")}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge variant="unread" className="shrink-0">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
