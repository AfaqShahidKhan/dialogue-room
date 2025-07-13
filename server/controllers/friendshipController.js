const Friendship = require("../models/friendshipModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");
const { activeUsers } = require("../socketManager");

// Send a friend request
exports.sendFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Prevent sending request to self
    if (req.user.id === userId) {
      return res.status(400).json({ message: "You cannot friend yourself" });
    }

    // Check if request already exists in either direction
    const existingRequest = await Friendship.findOne({
      $or: [
        { requester: req.user.id, recipient: userId },
        { requester: userId, recipient: req.user.id },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already exists" });
    }

    // Create a new friend request
    const newRequest = await Friendship.create({
      requester: req.user.id,
      recipient: userId,
      status: "pending",
    });

    // Emit socket event if recipient is online
    const io = req.app.get("io");
    const recipientSocketId = activeUsers.get(userId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("new-friend-request", {
        senderId: req.user.id,
        message: "You have a new friend request!",
      });
    }

    res.status(201).json({ status: "success", data: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.body;

  const friendRequest = await Friendship.findOneAndUpdate(
    { _id: requestId, recipient: req.user.id, status: "pending" },
    { status: "accepted" },
    { new: true }
  );

  if (!friendRequest) {
    return next(
      new AppError("Friend request not found or already accepted", 404)
    );
  }

  const io = req.app.get("io");
  const senderSocketId = activeUsers.get(friendRequest.requester.toString());
  if (senderSocketId) {
    io.to(senderSocketId).emit("friend-request-accepted", {
      recipientId: req.user.id,
      message: "Your friend request has been accepted!",
    });
  }

  res.status(200).json({
    status: "success",
    data: { friendRequest },
  });
});

exports.getPendingFriendRequests = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const pendingRequests = await Friendship.find({
    recipient: userId,
    status: "pending",
  })
    .populate("requester", "name email photo")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: { pendingRequests },
  });
});

exports.getUserFriends = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const friends = await Friendship.aggregate([
    {
      $match: {
        $or: [
          {
            requester: new mongoose.Types.ObjectId(String(userId)),
            status: "accepted",
          },
          {
            recipient: new mongoose.Types.ObjectId(String(userId)),
            status: "accepted",
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "requester",
        foreignField: "_id",
        as: "requesterDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "recipient",
        foreignField: "_id",
        as: "recipientDetails",
      },
    },
    {
      $project: {
        friend: {
          $cond: {
            if: {
              $eq: ["$requester", new mongoose.Types.ObjectId(String(userId))],
            },
            then: { $arrayElemAt: ["$recipientDetails", 0] },
            else: { $arrayElemAt: ["$requesterDetails", 0] },
          },
        },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: { friends },
  });
});

exports.cancelFriendRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.body;

  const friendRequest = await Friendship.findOneAndDelete({
    _id: requestId,
    requester: req.user.id,
    status: "pending",
  });

  if (!friendRequest) {
    return next(
      new AppError("Friend request not found or already accepted", 404)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Friend request canceled",
  });
});

exports.unfriend = catchAsync(async (req, res, next) => {
  const { friendId } = req.body;

  const friendship = await Friendship.findOneAndDelete({
    $or: [
      { requester: req.user.id, recipient: friendId, status: "accepted" },
      { requester: friendId, recipient: req.user.id, status: "accepted" },
    ],
  });

  if (!friendship) {
    return next(new AppError("Friendship not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Friend removed successfully",
  });
});
