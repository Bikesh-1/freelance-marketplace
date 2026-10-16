import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const jobs = await prisma.job.findMany({
      where: {
        OR: [
          { client: { userId } },
          { selectedFreelancer: { userId } },
          { applications: { some: { freelancer: { userId } } } },
        ],
      },
      include: {
        client: { select: { id: true, userId: true, companyName: true } },
        selectedFreelancer: { select: { id: true, userId: true, fullName: true } },
        messages: {
          where: { OR: [{ senderId: userId }, { receiverId: userId }] },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
            receiver: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    const conversations = jobs.map(job => ({
      id: job.id,
      jobId: job.id,
      title: job.title,
      status: job.status,
      client: job.client,
      selectedFreelancer: job.selectedFreelancer,
      lastMessage: job.messages[0] ?? null,
    }));
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json({ message: "Could not load conversations" }, { status: 500 });
  }
}
