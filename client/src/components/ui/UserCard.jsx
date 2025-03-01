import Image from "next/image";
import Button from "./Button";

const UserCard = ({ user, sendFriendRequest }) => {
  return (
    <div
      key={user._id}
      className="flex flex-col items-center gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition-all"
    >
      <Image
        src={`${
          process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"
        }/images/users/${user.photo}`}
        alt={user.name}
        width={48}
        height={48}
        className="w-16 h-16 rounded-full object-cover border"
      />
      <div className="text-center sm:text-left flex-1">
        <h4 className="text-lg font-semibold">{user.name}</h4>
        <p className="text-sm ">{user.country} - {user.age} years old</p>
        <p className="text-sm"><span className="font-medium">Fluent In:</span> {user.fluentIn}</p>
        <p className="text-sm"><span className="font-medium">Interested In:</span> {user.learningLanguage}</p>
      </div>
      <Button
        onClick={() => sendFriendRequest(user._id)}
      >
        Send Request
      </Button>
    </div>
  );
};

export default UserCard;
