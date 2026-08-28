import type { Request, Response } from "express";
import type {
  CreateConversationInput,
  MessagesQuery,
  SendMessageInput,
} from "@dialogue-room/shared";
import { asyncHandler } from "../middlewares/asyncHandler";
import * as conversationService from "../services/conversation.service";
import type { AuthenticatedRequest } from "../types/express";

export const createConversation = asyncHandler(
  async (req: Request<unknown, unknown, CreateConversationInput>, res: Response) => {
    const { user, body } = req as AuthenticatedRequest<object, unknown, CreateConversationInput>;
    const conversation = await conversationService.getOrCreateConversation(user.id, body.userId);
    res.status(201).json({ status: "success", data: { conversation } });
  },
);

export const listConversations = asyncHandler(async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const conversations = await conversationService.listConversations(user.id);
  res.status(200).json({ status: "success", data: { conversations } });
});

export const getMessages = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { user } = req as AuthenticatedRequest<{ id: string }>;
  const query = req.validatedQuery as MessagesQuery;
  const page = await conversationService.getMessages(user.id, req.params.id, {
    before: query.before,
    limit: query.limit,
  });
  res.status(200).json({ status: "success", data: page });
});

export const sendMessage = asyncHandler(
  async (req: Request<{ id: string }, unknown, SendMessageInput>, res: Response) => {
    const { user, body } = req as AuthenticatedRequest<{ id: string }, unknown, SendMessageInput>;
    const message = await conversationService.sendMessage(user.id, req.params.id, body.content);
    res.status(201).json({ status: "success", data: { message } });
  },
);

export const markConversationRead = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { user } = req as AuthenticatedRequest<{ id: string }>;
    const result = await conversationService.markConversationRead(user.id, req.params.id);
    res.status(200).json({ status: "success", data: result });
  },
);
