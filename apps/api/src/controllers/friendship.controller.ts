import type { Request, Response } from "express";
import type { SendFriendRequestInput } from "@dialogue-room/shared";
import { asyncHandler } from "../middlewares/asyncHandler";
import * as friendshipService from "../services/friendship.service";
import type { AuthenticatedRequest } from "../types/express";

export const sendFriendRequest = asyncHandler(
  async (req: Request<unknown, unknown, SendFriendRequestInput>, res: Response) => {
    const { user, body } = req as AuthenticatedRequest<object, unknown, SendFriendRequestInput>;
    const friendship = await friendshipService.sendFriendRequest(user, body.recipientId);
    res.status(201).json({ status: "success", data: { friendship } });
  },
);

export const acceptFriendRequest = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { user } = req as AuthenticatedRequest<{ id: string }>;
  const friendship = await friendshipService.acceptFriendRequest(user, req.params.id);
  res.status(200).json({ status: "success", data: { friendship } });
});

export const declineFriendRequest = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { user } = req as AuthenticatedRequest<{ id: string }>;
  await friendshipService.declineFriendRequest(user, req.params.id);
  res.status(200).json({ status: "success", message: "Friend request declined" });
});

export const cancelFriendRequest = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { user } = req as AuthenticatedRequest<{ id: string }>;
  await friendshipService.cancelFriendRequest(user, req.params.id);
  res.status(200).json({ status: "success", message: "Friend request cancelled" });
});

export const unfriend = asyncHandler(async (req: Request<{ userId: string }>, res: Response) => {
  const { user } = req as AuthenticatedRequest<{ userId: string }>;
  await friendshipService.unfriend(user, req.params.userId);
  res.status(200).json({ status: "success", message: "Unfriended" });
});

export const listFriends = asyncHandler(async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const friends = await friendshipService.listFriends(user);
  res.status(200).json({ status: "success", data: { friends } });
});

export const listIncomingRequests = asyncHandler(async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const requests = await friendshipService.listIncomingRequests(user);
  res.status(200).json({ status: "success", data: { requests } });
});

export const listOutgoingRequests = asyncHandler(async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const requests = await friendshipService.listOutgoingRequests(user);
  res.status(200).json({ status: "success", data: { requests } });
});
