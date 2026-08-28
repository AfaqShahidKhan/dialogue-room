import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id");

export const sendFriendRequestSchema = z
  .object({ recipientId: objectId })
  .strict();
export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;

export { objectId as objectIdSchema };
