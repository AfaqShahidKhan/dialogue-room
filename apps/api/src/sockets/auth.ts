import type { Socket } from "socket.io";
import type { ExtendedError } from "socket.io";
import { COOKIE_NAMES } from "@dialogue-room/shared";
import { verifyAccessToken } from "../utils/tokens";
import { User } from "../models/user.model";

/** Minimal cookie-header parser (no cookie-parser in the socket layer). */
function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

/**
 * Socket.IO handshake auth: read the dr_access cookie, verify it, load the user
 * (must exist and not have changed the password after the token was issued),
 * and stash socket.data.userId. Rejects the connection otherwise.
 */
export async function socketAuth(
  socket: Socket,
  next: (err?: ExtendedError) => void,
): Promise<void> {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies[COOKIE_NAMES.ACCESS];
    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("+passwordChangedAt");
    if (!user) {
      next(new Error("Unauthorized"));
      return;
    }
    if (typeof payload.iat === "number" && user.changedPasswordAfter(payload.iat)) {
      next(new Error("Unauthorized"));
      return;
    }

    socket.data.userId = user.id;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}
