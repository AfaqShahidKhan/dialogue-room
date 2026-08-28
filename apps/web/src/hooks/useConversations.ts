import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ConversationListItem } from "@dialogue-room/shared";
import { api } from "@/lib/api";

export function useConversations() {
  return useQuery<ConversationListItem[]>({
    queryKey: ["conversations"],
    queryFn: () =>
      api
        .get<{ conversations: ConversationListItem[] }>("/conversations")
        .then((data) => data.conversations),
  });
}

/** Total unread count across all conversations, for the sidebar nav badge. */
export function useTotalUnreadCount(): number {
  const { data } = useConversations();

  return useMemo(
    () => (data ?? []).reduce((sum, conversation) => sum + conversation.unreadCount, 0),
    [data],
  );
}
