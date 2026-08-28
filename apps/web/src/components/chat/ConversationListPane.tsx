"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageCircleOff, Search } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { ConversationListItemRow } from "@/components/chat/ConversationListItemRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="size-11 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="h-3.5 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConversationListPane({ className }: { className?: string }) {
  const { data, isLoading } = useConversations();
  const [query, setQuery] = useState("");
  const params = useParams<{ conversationId?: string }>();
  const activeId = params?.conversationId;

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((c) => c.otherUser.name.toLowerCase().includes(q));
  }, [data, query]);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <h1 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Chat</h1>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
            strokeWidth={1.75}
          />
          <Input
            placeholder="Search conversations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <ListSkeleton />
        ) : !data || data.length === 0 ? (
          <div className="px-4 py-8">
            <EmptyState
              icon={<MessageCircleOff className="size-6" aria-hidden="true" />}
              title="No conversations yet"
              description="Message a friend to start your first conversation."
              action={
                <Link href="/friends">
                  <Button size="sm">Go to friends</Button>
                </Link>
              }
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-8">
            <EmptyState title="No matches" description="No conversations match your search." />
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 px-2">
            {filtered.map((conversation) => (
              <ConversationListItemRow
                key={conversation._id}
                conversation={conversation}
                active={conversation._id === activeId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
