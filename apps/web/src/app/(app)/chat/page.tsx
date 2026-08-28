"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function ChatIndexPage() {
  const { data, isLoading } = useConversations();
  const hasNoConversations = !isLoading && (!data || data.length === 0);

  return (
    <div className="flex h-full items-center justify-center p-6">
      <EmptyState
        icon={<MessageCircle className="size-6" aria-hidden="true" />}
        title="Select a conversation"
        description={
          hasNoConversations
            ? "You don't have any conversations yet. Add friends to start chatting."
            : "Choose a conversation from the list to see your messages."
        }
        action={
          hasNoConversations ? (
            <Link href="/friends">
              <Button size="sm">Go to friends</Button>
            </Link>
          ) : undefined
        }
        className="border-none"
      />
    </div>
  );
}
