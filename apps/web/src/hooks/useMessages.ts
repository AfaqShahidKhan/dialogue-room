import { useInfiniteQuery } from "@tanstack/react-query";
import type { ChatMessage, MessagesPage } from "@dialogue-room/shared";
import { api } from "@/lib/api";

/**
 * ARCHITECTURE.md: GET /conversations/:id/messages?before=<cursor>&limit=30
 * returns { messages, nextCursor }, where `messages` is already ascending
 * (oldest->newest) within that page, and `nextCursor` points to the next
 * (older) page. TanStack's `data.pages[0]` is always the first-fetched page
 * (newest window); each subsequent page fetched via fetchNextPage() is an
 * older window appended after it. So pages, oldest-to-newest, is
 * `[...pages].reverse()`, and flat-mapping that yields one ascending list.
 */
export function useMessages(conversationId: string | null) {
  const query = useInfiniteQuery<MessagesPage>({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) =>
      api.get<MessagesPage>(`/conversations/${conversationId}/messages`, {
        params: { before: (pageParam as string | null) ?? undefined, limit: 30 },
      }),
    enabled: Boolean(conversationId),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // pages[0] is the newest page (most recent messages), pages[1] older, etc.
  // Each page's `messages` array is itself ascending (oldest->newest) per the
  // shared MessagesPage contract, so reversing the page order and
  // concatenating yields a single ascending chronological list.
  const messages: ChatMessage[] = query.data
    ? [...query.data.pages].reverse().flatMap((page) => page.messages)
    : [];

  return { ...query, messages };
}
