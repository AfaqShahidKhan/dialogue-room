"use client";

import { useEffect } from "react";
import FriendCard from "./FriendCard"; // ← make sure to import
import {
  acceptFriendRequest,
  cancelFriendRequest,
} from "@/store/services/friendService";
import { useSocket } from "@/app/providers/SocketProvider";

export default function FriendRequestList({ requests, setRequests }) {
  const socket = useSocket();

  // Listen for others accepting your sent requests
  useEffect(() => {
    if (!socket) return;
    const onAccepted = ({ recipientId }) => {
      console.log("Received accept event for:", recipientId);
      setRequests((prev) =>
        prev.filter((req) => req.requester._id !== recipientId)
      );
    };
    socket.on("friend-request-accepted", onAccepted);
    return () => {
      socket.off("friend-request-accepted", onAccepted);
    };
  }, [socket, setRequests]);

  const handleAccept = async (id) => {
    const { data } = await acceptFriendRequest(id);

    // pull your userId from cookies (same as in SocketProvider)
    const userId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user="))
      ?.split("=")[1];

    socket?.emit("accept-friend-request", {
      senderId: data.friendRequest.requester,
      recipientId: userId,
    });

    setRequests((prev) => prev.filter((req) => req._id !== id));
  };

  const handleDecline = async (id) => {
    await cancelFriendRequest(id);
    setRequests((prev) => prev.filter((req) => req._id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Friend Requests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.length > 0 ? (
          requests.map((req) => (
            <FriendCard
              key={req._id}
              friend={req}
              isRequest
              onAccept={() => handleAccept(req._id)}
              onDecline={() => handleDecline(req._id)}
            />
          ))
        ) : (
          <p>No pending requests.</p>
        )}
      </div>
    </div>
  );
}
