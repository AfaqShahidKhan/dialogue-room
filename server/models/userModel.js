const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/appError");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      minLength: [3, "Name should be at least 3 characters long"],
      maxLength: [20, "Name should not exceed 20 characters"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Email is required"],
      validate: [validator.isEmail, "Please enter a valid email"],
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
    agree: {
      type: Boolean,
      default: false,
    },
    country: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Non-Binary", "Other"],
    },
    birthdate: {
      type: Date,
    },
    learningLanguage: {
      type: [String],
      default: [],
    },
    fluentIn: {
      type: [String],
      default: [],
    },
    password: {
      type: String,
      minLength: [4, "Password should have at least 4 characters"],
      required: [true, "Password is required"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords do not match",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequests: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

userSchema.virtual("age").get(function () {
  if (!this.birthdate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (
    !this.isNew &&
    (!this.birthdate ||
      this.learningLanguage.length === 0 ||
      this.fluentIn.length === 0)
  ) {
    return next(
      new AppError(
        "Please complete your profile with birthdate, learning languages, and fluent languages."
      )
    );
  }
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
