"use client";

import { useEffect, useState } from "react";
import { fetchFriends } from "@/store/services/friendService";
import FriendList from "./FriendList";
import { useSocket } from "@/app/providers/SocketProvider";

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const socket = useSocket();

  // 1️⃣ Initial load
  useEffect(() => {
    fetchFriends().then((data) => setFriends(data));
  }, []);

  // 2️⃣ Real-time updates when *any* friend-request is accepted
  useEffect(() => {
    if (!socket) return;
    const handleAccepted = (
      {
        /* you can destructure senderId, recipientId if you want */
      }
    ) => {
      // Option A: re-fetch the entire list
      fetchFriends().then((data) => setFriends(data));

      // Option B (more advanced): push the new friend object into state directly
      // setFriends(prev => [...prev, newFriendObj]);
    };

    socket.on("friend-request-accepted", handleAccepted);
    return () => {
      socket.off("friend-request-accepted", handleAccepted);
    };
  }, [socket]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Friends</h1>
      <FriendList friends={friends} />
    </div>
  );
}
