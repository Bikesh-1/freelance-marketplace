import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "FREELANCER") {
      return NextResponse.json({ message: "Only freelancers can view their proposal" }, { status: 403 });
    }

    const { jobId } = await params;
    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json({ message: "Freelancer profile not found" }, { status: 404 });
    }

    const application = await prisma.application.findUnique({
      where: { jobId_freelancerId: { jobId, freelancerId: profile.id } },
      select: { id: true, status: true, proposedBudget: true, createdAt: true },
    });

    return NextResponse.json(
      { application },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("Fetch own application error:", error);
    return NextResponse.json({ message: "Could not load your proposal status" }, { status: 500 });
  }
}
