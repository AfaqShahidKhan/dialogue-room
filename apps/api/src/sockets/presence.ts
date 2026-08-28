/**
 * In-memory presence registry: userId -> set of live socket ids.
 * Online = the user has at least one open socket. Not shared across processes
 * (single-node deployment per ARCHITECTURE).
 */
const online = new Map<string, Set<string>>();

/** Register a socket for a user. Returns true if the user just came online (0→1). */
export function add(userId: string, socketId: string): boolean {
  let sockets = online.get(userId);
  const cameOnline = sockets === undefined || sockets.size === 0;
  if (!sockets) {
    sockets = new Set<string>();
    online.set(userId, sockets);
  }
  sockets.add(socketId);
  return cameOnline;
}

/** Deregister a socket. Returns true if the user just went fully offline (1→0). */
export function remove(userId: string, socketId: string): boolean {
  const sockets = online.get(userId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    online.delete(userId);
    return true;
  }
  return false;
}

export function isOnline(userId: string): boolean {
  const sockets = online.get(userId);
  return sockets !== undefined && sockets.size > 0;
}

/** Filter a list of userIds down to those currently online. */
export function onlineAmong(userIds: string[]): string[] {
  return userIds.filter((id) => isOnline(id));
}
