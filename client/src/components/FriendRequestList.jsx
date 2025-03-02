// src/components/FriendRequestList.jsx
import React from "react";
import FriendCard from "./FriendCard";
import { acceptFriendRequest, cancelFriendRequest } from "@/store/services/friendService";

const FriendRequestList = ({ requests, setRequests }) => {
  const handleAccept = async (id) => {
    await acceptFriendRequest(id);
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
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))
        ) : (
          <p>No pending requests.</p>
        )}
      </div>
    </div>
  );
};

export default FriendRequestList;
