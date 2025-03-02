import Image from "next/image";

const FriendCard = ({ friend, isRequest, onAccept, onDecline }) => {
  console.log("FriendCard received:", friend);

  return (
    <div className="p-4 border rounded-lg flex items-center gap-4 shadow-sm">
      <Image
        src={friend.photo ? `http://localhost:8000/images/users/${friend.photo}` : "/images/pagesData/default.jpg"}
        alt={friend.name || "Unknown User"}
        width={50}
        height={50}
        className="rounded-full"
      />
      <div className="flex-1">
        <h3 className="font-semibold">{friend.name || "Unknown User"}</h3>
        <p className="text-sm">{friend.email || "No email available"}</p>
      </div>
    </div>
  );
};


export default FriendCard;
