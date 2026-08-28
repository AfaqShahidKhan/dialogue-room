import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Friendship } from "@dialogue-room/shared";
import { api, ApiError } from "@/lib/api";

function useInvalidateFriendshipQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["friends"] });
    queryClient.invalidateQueries({ queryKey: ["requests", "incoming"] });
    queryClient.invalidateQueries({ queryKey: ["requests", "outgoing"] });
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export function useSendFriendRequest() {
  const invalidate = useInvalidateFriendshipQueries();
  return useMutation({
    mutationFn: (recipientId: string) =>
      api
        .post<{ friendship: Friendship }>("/friendships", { recipientId })
        .then((data) => data.friendship),
    onSuccess: () => {
      invalidate();
      toast.success("Friend request sent");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Failed to send friend request"));
    },
  });
}

export function useAcceptFriendRequest() {
  const invalidate = useInvalidateFriendshipQueries();
  return useMutation({
    mutationFn: (id: string) =>
      api
        .patch<{ friendship: Friendship }>(`/friendships/${id}/accept`)
        .then((data) => data.friendship),
    onSuccess: () => {
      invalidate();
      toast.success("Friend request accepted");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Failed to accept friend request"));
    },
  });
}

export function useDeclineFriendRequest() {
  const invalidate = useInvalidateFriendshipQueries();
  return useMutation({
    mutationFn: (id: string) =>
      api
        .patch<{ friendship: Friendship }>(`/friendships/${id}/decline`)
        .then((data) => data.friendship),
    onSuccess: () => {
      invalidate();
      toast.success("Friend request declined");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Failed to decline friend request"));
    },
  });
}

export function useCancelFriendRequest() {
  const invalidate = useInvalidateFriendshipQueries();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/friendships/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Friend request cancelled");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Failed to cancel friend request"));
    },
  });
}

export function useUnfriend() {
  const invalidate = useInvalidateFriendshipQueries();
  return useMutation({
    mutationFn: (userId: string) => api.delete(`/friendships/with/${userId}`),
    onSuccess: () => {
      invalidate();
      toast.success("Friend removed");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Failed to remove friend"));
    },
  });
}
