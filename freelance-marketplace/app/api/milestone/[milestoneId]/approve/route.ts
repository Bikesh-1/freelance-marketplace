import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ milestoneId: string }>;
  }
) {
  try {
    const { milestoneId } = await params;

    // 1. Authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // 2. Only CLIENT can approve
    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        {
          message:
            "Only clients can approve milestones",
        },
        { status: 403 }
      );
    }

    // 3. Get client profile
    const clientProfile =
      await prisma.clientProfile.findUnique({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      });

    if (!clientProfile) {
      return NextResponse.json(
        {
          message: "Client profile not found",
        },
        { status: 404 }
      );
    }

    // 4. Get milestone + job + escrow
    const milestone =
      await prisma.milestone.findUnique({
        where: {
          id: milestoneId,
        },
        include: {
          job: {
            select: {
              id: true,
              clientId: true,
            },
          },
          escrow: true,
        },
      });

    if (!milestone) {
      return NextResponse.json(
        {
          message: "Milestone not found",
        },
        { status: 404 }
      );
    }

    // 5. Verify client owns the job
    if (
      milestone.job.clientId !==
      clientProfile.id
    ) {
      return NextResponse.json(
        {
          message:
            "You do not have access to this milestone",
        },
        { status: 403 }
      );
    }

    // 6. Only SUBMITTED can be approved
    if (milestone.status !== "SUBMITTED") {
      return NextResponse.json(
        {
          message:
            "Only submitted milestones can be approved",
        },
        { status: 400 }
      );
    }

    // 7. Escrow must exist
    if (!milestone.escrow) {
      return NextResponse.json(
        {
          message:
            "Escrow not found for this milestone",
        },
        { status: 400 }
      );
    }

    // 8. Escrow must be funded
    if (milestone.escrow.status !== "FUNDED") {
      return NextResponse.json(
        {
          message:
            "Milestone escrow is not funded",
        },
        { status: 400 }
      );
    }

    // 9. Approve milestone
    const updatedMilestone =
      await prisma.milestone.update({
        where: {
          id: milestoneId,
        },
        data: {
          status: "APPROVED",
        },
        include: {
          escrow: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Milestone approved successfully",
        milestone: updatedMilestone,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Approve milestone error:",
      error
    );

    return NextResponse.json(
      {
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}