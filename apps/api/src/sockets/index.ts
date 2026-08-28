import type { Server } from "socket.io";
import { setIo } from "./emitter";
import { socketAuth } from "./auth";
import { registerChatHandlers } from "./chat.handlers";

/**
 * Socket.IO bootstrap:
 *  - handshake auth middleware (io.use) verifying the dr_access cookie
 *  - per-connection presence + chat handlers (join user room, conversation
 *    join/leave, message:send, typing relay, read, presence broadcasts)
 */
export function registerSockets(io: Server): void {
  setIo(io);

  io.use((socket, next) => {
    void socketAuth(socket, next);
  });

  io.on("connection", (socket) => {
    registerChatHandlers(io, socket);
  });
}
