import type { Server } from "socket.io";
import type { SocketEventName } from "@dialogue-room/shared";

let ioInstance: Server | null = null;

export function setIo(io: Server): void {
  ioInstance = io;
}

export function getIo(): Server {
  if (!ioInstance) throw new Error("Socket.IO not initialized — setIo() must run at boot");
  return ioInstance;
}

/** Emit to every open socket of one user. */
export function emitToUser(userId: string, event: SocketEventName, payload: unknown): void {
  ioInstance?.to(`user:${userId}`).emit(event, payload);
}

/** Emit to everyone currently joined to a conversation room. */
export function emitToConversation(
  conversationId: string,
  event: SocketEventName,
  payload: unknown,
): void {
  ioInstance?.to(`conversation:${conversationId}`).emit(event, payload);
}
