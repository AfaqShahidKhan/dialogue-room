import { Router } from "express";
import {
  createConversationSchema,
  messagesQuerySchema,
  sendMessageSchema,
} from "@dialogue-room/shared";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import * as conversationController from "../controllers/conversation.controller";

export const conversationRouter = Router();

conversationRouter.use(authenticate);

conversationRouter.post("/", validate(createConversationSchema), conversationController.createConversation);
conversationRouter.get("/", conversationController.listConversations);
conversationRouter.get(
  "/:id/messages",
  validate(messagesQuerySchema, "query"),
  conversationController.getMessages,
);
conversationRouter.post(
  "/:id/messages",
  validate(sendMessageSchema),
  conversationController.sendMessage,
);
conversationRouter.patch("/:id/read", conversationController.markConversationRead);
