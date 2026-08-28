"use client";

import { createContext, useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SOCKET_EVENTS } from "@dialogue-room/shared";
import type {
  FriendRequestPayload,
  PresenceSnapshotPayload,
  PresenceUpdatePayload,
} from "@dialogue-room/shared";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/authStore";
import { usePresenceStore } from "@/stores/presenceStore";

const SocketContext = createContext<null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const setSnapshot = usePresenceStore((state) => state.setSnapshot);
  const setOnline = usePresenceStore((state) => state.setOnline);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();

    const handlePresenceSnapshot = (payload: PresenceSnapshotPayload) => {
      setSnapshot(payload.onlineUserIds);
    };
    const handlePresenceUpdate = (payload: PresenceUpdatePayload) => {
      setOnline(payload.userId, payload.online);
    };
    const handleFriendRequestNew = (payload: FriendRequestPayload) => {
      const requesterName =
        typeof payload.friendship.requester === "string"
          ? "Someone"
          : payload.friendship.requester.name;
      toast(`${requesterName} sent you a friend request`);
      queryClient.invalidateQueries({ queryKey: ["requests", "incoming"] });
    };
    const handleFriendRequestAccepted = (payload: FriendRequestPayload) => {
      const recipientName =
        typeof payload.friendship.recipient === "string"
          ? "Someone"
          : payload.friendship.recipient.name;
      toast.success(`${recipientName} accepted your friend request`);
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["requests", "outgoing"] });
    };

    socket.on(SOCKET_EVENTS.PRESENCE_SNAPSHOT, handlePresenceSnapshot);
    socket.on(SOCKET_EVENTS.PRESENCE_UPDATE, handlePresenceUpdate);
    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_NEW, handleFriendRequestNew);
    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, handleFriendRequestAccepted);

    return () => {
      socket.off(SOCKET_EVENTS.PRESENCE_SNAPSHOT, handlePresenceSnapshot);
      socket.off(SOCKET_EVENTS.PRESENCE_UPDATE, handlePresenceUpdate);
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_NEW, handleFriendRequestNew);
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, handleFriendRequestAccepted);
    };
  }, [user, queryClient, setSnapshot, setOnline]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return <SocketContext.Provider value={null}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return getSocket();
}

export function useSocketContext() {
  return useContext(SocketContext);
}
