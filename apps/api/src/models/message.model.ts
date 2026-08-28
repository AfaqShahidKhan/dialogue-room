import { Schema, model, Types, type HydratedDocument, type Model } from "mongoose";
import { LIMITS } from "@dialogue-room/shared";

export interface MessageAttributes {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageDocument = HydratedDocument<MessageAttributes>;

type MessageModel = Model<MessageAttributes>;

const messageSchema = new Schema<MessageAttributes, MessageModel>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: LIMITS.MESSAGE_MAX,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Cursor pagination: newest-first within a conversation.
messageSchema.index({ conversation: 1, _id: -1 });

export const Message = model<MessageAttributes, MessageModel>("Message", messageSchema);
