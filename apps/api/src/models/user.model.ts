import crypto from "node:crypto";
import { Schema, model, type HydratedDocument, type Model } from "mongoose";
import bcrypt from "bcryptjs";
import { GENDERS, type Gender } from "@dialogue-room/shared";

export interface UserAttributes {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  photo: string;
  bio?: string;
  country?: string;
  gender?: Gender;
  birthdate?: Date;
  fluentLanguages: string[];
  learningLanguages: string[];
  onboardingComplete: boolean;
  agreedToTerms: boolean;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMethods {
  comparePassword(candidate: string): Promise<boolean>;
  changedPasswordAfter(jwtTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

export type UserDocument = HydratedDocument<UserAttributes, UserMethods> & {
  age?: number;
};

type UserModel = Model<UserAttributes, object, UserMethods>;

const userSchema = new Schema<UserAttributes, UserModel, UserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    bio: {
      type: String,
      maxlength: 300,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: GENDERS,
    },
    birthdate: {
      type: Date,
    },
    fluentLanguages: {
      type: [String],
      default: [],
    },
    learningLanguages: {
      type: [String],
      default: [],
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    agreedToTerms: {
      type: Boolean,
      required: [true, "You must agree to the terms and conditions"],
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    lastSeenAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("age").get(function (this: UserAttributes) {
  if (!this.birthdate) return undefined;
  const today = new Date();
  const birthdate = new Date(this.birthdate);
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age -= 1;
  }
  return age;
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  // Subtract 1s to safely account for JWT issued-at timestamp precision.
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp: number): boolean {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtTimestamp < changedTimestamp;
};

userSchema.methods.createPasswordResetToken = function (): string {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return rawToken;
};

export const User = model<UserAttributes, UserModel>("User", userSchema);
