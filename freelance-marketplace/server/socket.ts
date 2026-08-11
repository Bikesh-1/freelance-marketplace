import { Server } from "socket.io";

const onlineUsers = new Map<
  string,
  string
>();

export function registerSocketHandlers(
  io: Server
) {
  io.on(
    "connection",
    (socket) => {
      console.log(
        "Socket connected:",
        socket.id
      );

      socket.on(
        "join-job",
        ({
          jobId,
          userId,
        }) => {
          socket.join(jobId);

          onlineUsers.set(
            userId,
            socket.id
          );

          io.to(jobId).emit(
            "online-users",
            Array.from(
              onlineUsers.keys()
            )
          );
        }
      );

      socket.on(
        "typing",
        ({ jobId, userId }) => {
          socket
            .to(jobId)
            .emit("typing", {
              userId,
            });
        }
      );

      socket.on(
        "stop-typing",
        ({
          jobId,
          userId,
        }) => {
          socket
            .to(jobId)
            .emit(
              "stop-typing",
              { userId }
            );
        }
      );

      socket.on(
        "messages-read",
        ({ jobId, userId }) => {
          socket.to(jobId).emit(
            "messages-read",
            { userId }
          );
        }
      );

      socket.on(
        "send-message",
        (message) => {
          io.to(
            message.jobId
          ).emit(
            "receive-message",
            message
          );
        }
      );
      socket.on(
        "send-notification",
        (notification) => {
          io.to(
            notification.userId
          ).emit(
            "receive-notification",
            notification
          );
        }
      );

      socket.on(
        "join-user",
        ({ userId }) => {
          socket.join(userId);
        }
      );
      socket.on(
        "disconnect",
        () => {
          for (const [
            userId,
            socketId,
          ] of onlineUsers) {
            if (
              socketId === socket.id
            ) {
              onlineUsers.delete(
                userId
              );
              break;
            }
          }

          console.log(
            "Socket disconnected:",
            socket.id
          );
        }
      );
    }
  );
}