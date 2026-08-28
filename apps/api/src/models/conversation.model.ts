import { Schema, model, Types, type HydratedDocument, type Model } from "mongoose";

export interface ConversationAttributes {
  /** Canonical sorted [smaller, larger] ObjectId pair (query convenience). */
  participants: [Types.ObjectId, Types.ObjectId];
  /**
   * Scalar "smallerId:largerId" key carrying the unique constraint. A unique
   * index on the participants ARRAY would be multikey (unique per element ⇒
   * one conversation per user, total) — uniqueness must live on a scalar.
   */
  pairKey: string;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  /** Map of userId -> last-read timestamp. */
  readState: Map<string, Date>;
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationDocument = HydratedDocument<ConversationAttributes>;

type ConversationModel = Model<ConversationAttributes>;

const conversationSchema = new Schema<ConversationAttributes, ConversationModel>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    lastMessageAt: {
      type: Date,
    },
    lastMessagePreview: {
      type: String,
    },
    readState: {
      type: Map,
      of: Date,
      default: () => new Map<string, Date>(),
    },
    pairKey: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ pairKey: 1 }, { unique: true });

conversationSchema.pre("validate", function (next) {
  if (Array.isArray(this.participants) && this.participants.length === 2) {
    const [a, b] = this.participants.map((id) => id.toString()).sort();
    this.participants = [new Types.ObjectId(a!), new Types.ObjectId(b!)];
    this.pairKey = `${a}:${b}`;
  }
  next();
});

export const Conversation = model<ConversationAttributes, ConversationModel>(
  "Conversation",
  conversationSchema,
);
