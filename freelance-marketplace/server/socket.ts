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

    socket.on("send-message", async (payload) => {
      if (!payload || typeof payload.jobId !== "string" ||
          typeof payload.content !== "string" || !payload.content.trim() ||
          payload.content.trim().length > 5000 || !socket.rooms.has(payload.jobId)) {
        return;
      }

      try {
        const job = await prisma.job.findUnique({
          where: { id: payload.jobId },
          include: {
            client: { select: { userId: true } },
            selectedFreelancer: { select: { userId: true } },
          },
        });

        if (!job) {
          socket.emit("message-error", { message: "Job not found." });
          return;
        }

        const participantIds = [
          job.client.userId,
          job.selectedFreelancer?.userId,
        ].filter((id): id is string => Boolean(id));

        if (!participantIds.includes(authenticatedUserId)) {
          socket.emit("message-error", { message: "You are not a participant in this job." });
          return;
        }

        const receiverId = participantIds.find((id) => id !== authenticatedUserId);
        if (!receiverId) {
          socket.emit("message-error", { message: "No recipient is assigned to this job yet." });
          return;
        }

        const message = await prisma.message.create({
          data: {
            jobId: payload.jobId,
            senderId: authenticatedUserId,
            receiverId,
            content: payload.content.trim(),
          },
          include: {
            sender: { select: { id: true, name: true } },
          },
        });

        io.to(payload.jobId).emit("receive-message", message);
      } catch (error) {
        console.error("Persist socket message error:", error);
        socket.emit("message-error", { message: "Message could not be saved. Please try again." });
      }
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
