import { useQuery } from "@tanstack/react-query";
import type { Friendship, PublicUser } from "@dialogue-room/shared";
import { api } from "@/lib/api";

export function useFriends() {
  return useQuery<PublicUser[]>({
    queryKey: ["friends"],
    queryFn: () =>
      api.get<{ friends: PublicUser[] }>("/friendships/friends").then((data) => data.friends),
  });
}

export function useIncomingRequests() {
  return useQuery<Friendship[]>({
    queryKey: ["requests", "incoming"],
    queryFn: () =>
      api
        .get<{ requests: Friendship[] }>("/friendships/requests/incoming")
        .then((data) => data.requests),
  });
}

export function useOutgoingRequests() {
  return useQuery<Friendship[]>({
    queryKey: ["requests", "outgoing"],
    queryFn: () =>
      api
        .get<{ requests: Friendship[] }>("/friendships/requests/outgoing")
        .then((data) => data.requests),
  });
}
