import { Schema, model, Types, type HydratedDocument, type Model } from "mongoose";
import { FRIENDSHIP_STATUSES, type FriendshipStatus } from "@dialogue-room/shared";

export interface FriendshipAttributes {
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  status: FriendshipStatus;
  /** Canonical sorted [smaller, larger] ObjectId pair (query convenience). */
  userPair: [Types.ObjectId, Types.ObjectId];
  /**
   * Scalar "smallerId:largerId" key carrying the unique constraint. A unique
   * index on the userPair ARRAY would be multikey (unique per element ⇒ one
   * friendship per user, total) — uniqueness must live on a scalar.
   */
  pairKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FriendshipDocument = HydratedDocument<FriendshipAttributes>;

type FriendshipModel = Model<FriendshipAttributes>;

const friendshipSchema = new Schema<FriendshipAttributes, FriendshipModel>(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: FRIENDSHIP_STATUSES,
      default: "pending",
    },
    userPair: {
      type: [Schema.Types.ObjectId],
      required: true,
    },
    pairKey: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

friendshipSchema.index({ userPair: 1 });
friendshipSchema.index({ pairKey: 1 }, { unique: true });

friendshipSchema.pre("validate", function (next) {
  if (this.requester && this.recipient) {
    const [a, b] = [this.requester.toString(), this.recipient.toString()].sort();
    this.userPair = [new Types.ObjectId(a!), new Types.ObjectId(b!)];
    this.pairKey = `${a}:${b}`;
  }
  next();
});

export const Friendship = model<FriendshipAttributes, FriendshipModel>(
  "Friendship",
  friendshipSchema,
);
