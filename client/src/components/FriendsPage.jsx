// src/components/FriendsPage.jsx
"use client";
import React, { useEffect, useState } from "react";
import FriendList from "./FriendList";
import FriendRequestList from "./FriendRequestList";
import {
  fetchFriends,
  fetchFriendRequests,
} from "@/store/services/friendService";

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const loadFriendRequests = async () => {
      const friendRequests = await fetchFriendRequests();
      setFriendRequests(friendRequests);
    };
    const loadFriends = async () => {
      const friendsData = await fetchFriends();
      setFriends(friendsData);
    };
    loadFriendRequests();
    loadFriends();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Friends</h1>
      <FriendRequestList
        requests={friendRequests}
        setRequests={setFriendRequests}
      />
      <FriendList friends={friends} />
    </div>
  );
};

export default FriendsPage;
