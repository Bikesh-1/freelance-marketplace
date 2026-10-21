import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const jobId = typeof input.jobId === "string" ? input.jobId.trim() : "";
    const receiverId = typeof input.receiverId === "string" ? input.receiverId.trim() : "";
    const content = typeof input.content === "string" ? input.content.trim() : "";

    if (!jobId || !receiverId || !content) {
      return NextResponse.json({ message: "jobId, receiverId and content are required" }, { status: 400 });
    }
    if (content.length > 5000) {
      return NextResponse.json({ message: "Message must be 5,000 characters or fewer" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        client: { select: { userId: true } },
        selectedFreelancer: { select: { userId: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    const senderId = session.user.id;
    const allowedUsers = [job.client.userId, job.selectedFreelancer?.userId].filter(Boolean);

    if (!allowedUsers.includes(senderId)) {
      return NextResponse.json({ message: "You are not a participant in this job" }, { status: 403 });
    }
    if (!allowedUsers.includes(receiverId)) {
      return NextResponse.json({ message: "Receiver is not part of this job" }, { status: 403 });
    }
    if (receiverId === senderId) {
      return NextResponse.json({ message: "You cannot message yourself" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: { jobId, senderId, receiverId, content },
      include: { sender: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
