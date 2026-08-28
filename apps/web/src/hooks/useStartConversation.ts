import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ConversationListItem } from "@dialogue-room/shared";
import { api, ApiError } from "@/lib/api";

/** Get-or-create a conversation with a friend, then navigate to it. */
export function useStartConversation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  async function startConversation(userId: string) {
    setPendingUserId(userId);
    try {
      const { conversation } = await api.post<{ conversation: ConversationListItem }>(
        "/conversations",
        { userId },
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/chat/${conversation._id}`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to start conversation");
    } finally {
      setPendingUserId(null);
    }
  }

  return { startConversation, pendingUserId };
}
