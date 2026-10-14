import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const disputes = await prisma.dispute.findMany({
      where: isAdmin ? undefined : {
        OR: [
          { openedById: session.user.id },
          { milestone: { job: { client: { userId: session.user.id } } } },
          { milestone: { job: { selectedFreelancer: { userId: session.user.id } } } },
        ],
      },
      select: {
        id: true,
        milestoneId: true,
        openedById: true,
        reason: true,
        evidence: true,
        status: true,
        adminNotes: isAdmin,
        resolvedAt: true,
        createdAt: true,
        updatedAt: true,
        openedBy: { select: { id: true, name: true, role: true } },
        milestone: {
          select: {
            id: true,
            title: true,
            status: true,
            amount: true,
            job: { select: { id: true, title: true, clientId: true, selectedFreelancerId: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ disputes });
  } catch (error) {
    console.error("GET /api/dispute error:", error);
    return NextResponse.json({ message: "Failed to fetch disputes" }, { status: 500 });
  }
}
