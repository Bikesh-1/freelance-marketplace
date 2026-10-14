import { io } from "socket.io-client";

const socketUrl =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");

export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});
