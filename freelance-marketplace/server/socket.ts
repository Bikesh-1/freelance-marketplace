import { Server, Socket } from "socket.io";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

const onlineUsers = new Map<string, string>();

export function registerSocketHandlers(io: Server) {
  io.use(async (socket, next) => {
    try {
      const token = await getToken({
        req: socket.request as never,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (!token?.id || typeof token.id !== "string") {
        return next(new Error("Unauthorized"));
      }
      socket.data.userId = token.id;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const authenticatedUserId = socket.data.userId as string;
    console.log("Authenticated socket connected:", socket.id);

    socket.on("join-job", async ({ jobId } = {}) => {
      if (typeof jobId !== "string" || !jobId) return;
      try {
        const job = await prisma.job.findUnique({
          where: { id: jobId },
          include: {
            client: { select: { userId: true } },
            selectedFreelancer: { select: { userId: true } },
          },
        });
        const isParticipant =
          job?.client.userId === authenticatedUserId ||
          job?.selectedFreelancer?.userId === authenticatedUserId;
        if (!isParticipant) return;

        await socket.join(jobId);
        onlineUsers.set(authenticatedUserId, socket.id);
        io.to(jobId).emit("online-users", Array.from(onlineUsers.keys()));
      } catch (error) {
        console.error("Socket job authorization error:", error);
      }
    });

    socket.on("typing", ({ jobId } = {}) => {
      if (typeof jobId !== "string" || !socket.rooms.has(jobId)) return;
      socket.to(jobId).emit("typing", { userId: authenticatedUserId });
    });

    socket.on("stop-typing", ({ jobId } = {}) => {
      if (typeof jobId !== "string" || !socket.rooms.has(jobId)) return;
      socket.to(jobId).emit("stop-typing", { userId: authenticatedUserId });
    });

    socket.on("messages-read", ({ jobId } = {}) => {
      if (typeof jobId !== "string" || !socket.rooms.has(jobId)) return;
      socket.to(jobId).emit("messages-read", { userId: authenticatedUserId });
    });

    socket.on("send-message", (message) => {
      if (!message || typeof message.jobId !== "string" ||
          typeof message.content !== "string" || !message.content.trim() ||
          message.content.length > 5000 || !socket.rooms.has(message.jobId)) return;
      io.to(message.jobId).emit("receive-message", {
        jobId: message.jobId,
        userId: authenticatedUserId,
        content: message.content.trim(),
      });
    });

    socket.on("join-user", () => {
      socket.join(authenticatedUserId);
    });

    socket.on("disconnect", () => {
      if (onlineUsers.get(authenticatedUserId) === socket.id) {
        onlineUsers.delete(authenticatedUserId);
      }
      console.log("Socket disconnected:", socket.id);
    });
  });
}
