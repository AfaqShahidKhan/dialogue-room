const Friendship = require("../models/friendshipModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

// ✅ Send Friend Request
exports.sendFriendRequest = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  if (req.user.id === userId) {
    return next(
      new AppError("You cannot send a friend request to yourself!", 400)
    );
  }

  const existingRequest = await Friendship.findOne({
    $or: [
      { requester: req.user.id, recipient: userId },
      { requester: userId, recipient: req.user.id },
    ],
  });

  if (existingRequest) {
    if (existingRequest.status === "accepted") {
      return next(new AppError("You are already friends!", 400));
    }
    return next(new AppError("Friend request already exists!", 400));
  }

  const friendRequest = await Friendship.create({
    requester: req.user.id,
    recipient: userId,
    status: "pending",
  });

  res.status(201).json({
    status: "success",
    data: { friendRequest },
  });
});

// ✅ Accept Friend Request
exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.body;

  const friendRequest = await Friendship.findOneAndUpdate(
    { _id: requestId, recipient: req.user.id, status: "pending" },
    { status: "accepted" },
    { new: true }
  );
  
  if (!friendRequest) {
    return next(new AppError("Friend request not found or already accepted", 404));
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


// ✅ Get User's Friends
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

// ✅ Cancel Friend Request (Sender can cancel)
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

// ✅ Unfriend (Remove from friends list)
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
