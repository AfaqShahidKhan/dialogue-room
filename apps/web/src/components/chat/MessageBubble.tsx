"use client";

import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import type { ChatMessage, PublicUser } from "@dialogue-room/shared";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  otherUser: PublicUser;
  /** Last message in its consecutive-sender group — shows avatar/timestamp. */
  isGroupEnd: boolean;
  /** First message in its consecutive-sender group — slightly larger gap above. */
  isGroupStart: boolean;
  /** True when this is my own last message overall and it has been read. */
  showReadReceipt: boolean;
}

export function MessageBubble({
  message,
  isMine,
  otherUser,
  isGroupEnd,
  isGroupStart,
  showReadReceipt,
}: MessageBubbleProps) {
  const isPending = message._id.startsWith("temp-");

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isMine ? "justify-end" : "justify-start",
        isGroupStart ? "mt-3" : "mt-0.5",
      )}
    >
      {!isMine && (
        <div className="size-7 shrink-0">
          {isGroupEnd && <Avatar photo={otherUser.photo} name={otherUser.name} size={28} />}
        </div>
      )}

      <div className={cn("flex max-w-[72%] flex-col", isMine ? "items-end" : "items-start")}>
        <div
          className={cn(
            "whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm shadow-sm",
            isMine
              ? cn("bg-brand-600 text-white", isGroupEnd ? "rounded-br-md" : "")
              : cn(
                  "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
                  isGroupEnd ? "rounded-bl-md" : "",
                ),
            isPending && "opacity-70",
          )}
        >
          {message.content}
        </div>

        {isGroupEnd && (
          <div className="mt-1 flex items-center gap-1 px-1 text-[11px] text-slate-400 dark:text-slate-500">
            <span>{format(new Date(message.createdAt), "h:mm a")}</span>
            {isMine && showReadReceipt && (
              <CheckCheck className="size-3.5 text-brand-300" aria-label="Read" />
            )}
            {isMine && !showReadReceipt && !isPending && (
              <Check className="size-3.5" aria-label="Sent" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
