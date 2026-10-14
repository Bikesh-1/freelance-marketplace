import { createServer } from "http";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket";

const httpServer = createServer();
const allowedOrigins = (process.env.SOCKET_CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

registerSocketHandlers(io);

const port = Number(process.env.SOCKET_PORT || 3001);
httpServer.listen(port, () => {
  console.log(`Socket server running on port ${port}`);
});
