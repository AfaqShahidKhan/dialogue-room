import http from "node:http";
import { Server } from "socket.io";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/db";
import { createApp } from "./app";
import { registerSockets } from "./sockets";

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });
  registerSockets(io);

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received — shutting down gracefully`);
    io.close();
    httpServer.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled rejection:", reason);
});

main().catch((err) => {
  console.error("💥 Failed to start server:", err);
  process.exit(1);
});
