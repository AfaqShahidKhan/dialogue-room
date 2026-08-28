import { z } from "zod";
import { LIMITS } from "../constants";
import { objectIdSchema } from "./friendship.schemas";

export const createConversationSchema = z
  .object({ userId: objectIdSchema })
  .strict();
export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const sendMessageSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(LIMITS.MESSAGE_MAX, `Message must be at most ${LIMITS.MESSAGE_MAX} characters`),
  })
  .strict();
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

/** Socket `message:send` payload — REST body plus routing fields. */
export const socketSendMessageSchema = z
  .object({
    conversationId: objectIdSchema,
    content: sendMessageSchema.shape.content,
    tempId: z.string().max(64).optional(),
  })
  .strict();
export type SocketSendMessageInput = z.infer<typeof socketSendMessageSchema>;

export const messagesQuerySchema = z
  .object({
    before: objectIdSchema.optional(),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(LIMITS.MESSAGES_PAGE_MAX)
      .default(LIMITS.MESSAGES_PAGE_DEFAULT),
  })
  .strict();
export type MessagesQuery = z.infer<typeof messagesQuerySchema>;
