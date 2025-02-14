const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const AppError = require("./../utils/appError");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      minLength: [3, "Name should be of 3 characters or more"],
      maxLength: [20, "Name should have maximum 20 characters"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Email is required"],
      validate: [validator.isEmail, "Please write correct email"],
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
      required: [true, "Birthdate is required"],
    },
    learningLanguage: {
      type: [String],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one learning language is required.",
      },
    },
    fluentIn: {
      type: [String],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one fluent language is required.",
      },
    },
    password: {
      type: String,
      minLength: [4, "Password should have minimum 4 characters"],
      required: [true, "Password is required"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please Confirm the password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords do not match",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: {
      type: Date,
    },
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

// Virtual field to calculate age
userSchema.virtual("age").get(function () {
  const currentDate = new Date();
  const birthDate = new Date(this.birthdate);
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const month = currentDate.getMonth();
  const birthMonth = birthDate.getMonth();

  if (
    month < birthMonth ||
    (month === birthMonth && currentDate.getDate() < birthDate.getDate())
  ) {
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

userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  const isCorrect = await bcrypt.compare(candidatePassword, userPassword);
  // console.log(
  //   `cadidate p is ${typeof candidatePassword} and user p is ${typeof userPassword} and is correct is ${isCorrect}`
  // );

  return isCorrect;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    console.log(
      `password changed at: ${this.passwordChangedAt}, ${JWTTimestamp}`
    );
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
