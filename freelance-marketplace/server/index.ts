import { createServer } from "http";
import { Server } from "socket.io";

import { registerSocketHandlers } from "./socket";

const httpServer =
  createServer();

const io = new Server(
  httpServer,
  {
    cors: {
      origin:
        "http://localhost:3000",
      credentials: true,
    },
  }
);

registerSocketHandlers(io);

httpServer.listen(
  3001,
  () => {
    console.log(
      "Socket server running on port 3001"
    );
  }
);