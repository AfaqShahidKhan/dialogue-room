const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Ensure NODE_ENV is defined
const nodeEnv = process.env.NODE_ENV || "development";
console.log(`Currently running in -- ${nodeEnv}`);

const databaseUri = process.env.DATABASE_PROD || process.env.DATABASE_LOCAL;
if (!databaseUri) {
  console.error("DATABASE URI is not set. Check environment variables.");
  process.exit(1);
}

console.log("Connecting to:", databaseUri);

mongoose
  .connect(databaseUri) // No need for useNewUrlParser & useUnifiedTopology
  .then(() => console.log("✅ DB connection successful!"))
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  });

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

// Create HTTP server and integrate with Express
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from frontend
    methods: ["GET", "POST"],
  },
});

// Store active users
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 New user connected: ${socket.id}`);

  // Store user ID when they join
  socket.on("join", (userId) => {
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} is now online`);
  });

  // Handle sending a friend request
  socket.on("send-friend-request", (data) => {
    const recipientSocketId = activeUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("new-friend-request", {
        senderId: data.senderId,
        message: "You have a new friend request!",
      });
    }
  });

  // Handle accepting a friend request
  socket.on("accept-friend-request", (data) => {
    const senderSocketId = activeUsers.get(data.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("friend-request-accepted", {
        recipientId: data.recipientId,
        message: "Your friend request has been accepted!",
      });
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`User ${userId} went offline`);
        break;
      }
    }
  });
});

// Attach io to the request object (for controllers)
app.set("io", io);

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`🚀 Server running on port ${port}`));

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully...");
  server.close(() => {
    console.log("💤 Process terminated!");
  });
});
