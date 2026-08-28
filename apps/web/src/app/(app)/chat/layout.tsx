"use client";

import { useParams } from "next/navigation";
import { ConversationListPane } from "@/components/chat/ConversationListPane";
import { cn } from "@/lib/cn";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ conversationId?: string }>();
  const hasActiveConversation = Boolean(params?.conversationId);

  return (
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] overflow-hidden rounded-none border-slate-200 dark:border-slate-800 sm:-m-6 lg:-m-8 lg:h-[calc(100dvh-2rem)] lg:rounded-2xl lg:border">
      <div
        className={cn(
          "w-full shrink-0 border-slate-200 dark:border-slate-800 lg:w-80 lg:border-r",
          hasActiveConversation ? "hidden lg:block" : "block",
        )}
      >
        <ConversationListPane />
      </div>
      <div className={cn("min-w-0 flex-1", hasActiveConversation ? "block" : "hidden lg:block")}>
        {children}
      </div>
    </div>
  );
}
