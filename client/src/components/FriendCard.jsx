import Image from "next/image";

const FriendCard = ({ friend, isRequest, onAccept, onDecline }) => {
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
