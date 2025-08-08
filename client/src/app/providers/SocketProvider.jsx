"use client";

import { io } from "socket.io-client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const hasJoined = useRef(false);

  useEffect(() => {
    const sock = io("http://localhost:8080", { withCredentials: true });
    setSocket(sock);

    sock.on("connect", () => {
      if (!hasJoined.current) {
        // Replace this with however you get your user’s ID:
        const userId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("userId="))
          ?.split("=")[1];

        sock.emit("join", userId);
        hasJoined.current = true;
      }
    });

    return () => sock.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
