import React from "react";
import FriendCard from "./FriendCard";

const FriendList = ({ friends }) => {
  console.log("Rendering FriendList with:", friends); // Debugging log

  if (!Array.isArray(friends) || friends.length === 0) {
    return <p>No friends found.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Your Friends</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {friends.map((friendObj, index) =>
          friendObj.friend ? (
            <FriendCard key={friendObj.friend._id || index} friend={friendObj.friend} />
          ) : (
            <p key={index}>Invalid friend data</p>
          )
        )}
      </div>
    </div>
  );
};

export default FriendList;
