import Image from "next/image";
import Button from "./ui/Button";

const FriendCard = ({ friend, isRequest, onAccept, onDecline }) => {
  console.log("FriendCard received:", friend);

  return (
    <div className="p-4 border rounded-lg flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <Image
        src={
          friend.requester.photo
            ? `http://localhost:8080/images/users/${friend.requester.photo}`
            : "/images/pagesData/default.jpg"
        }
        alt={friend.requester.name || "Unknown User"}
        width={50}
        height={50}
        className="rounded-full"
      />
      <div className="text-center">
        <h3 className="font-semibold text-lg text-gray-800">
          {friend.requester.name || "Unknown User"}
        </h3>
        <p className="text-sm text-gray-600">
          {friend.requester.email || "No email available"}
        </p>
      </div>
    </div>
  );
};

export default FriendCard;
