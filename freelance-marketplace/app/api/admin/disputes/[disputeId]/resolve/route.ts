import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      disputeId: string;
    }>;
  }
) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          message:
            "Admin access required",
        },
        { status: 403 }
      );
    }

    const { disputeId } =
      await params;

    const body = await req.json();

    const { decision, note } = body;

    if (
      decision !== "CLIENT_WON" &&
      decision !== "FREELANCER_WON"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid dispute decision",
        },
        { status: 400 }
      );
    }

    const dispute =
      await prisma.dispute.findUnique({
        where: {
          id: disputeId,
        },
        include: {
          milestone: {
            include: {
              escrow: true,
              job: true,
            },
          },
        },
      });

    if (!dispute) {
      return NextResponse.json(
        {
          message:
            "Dispute not found",
        },
        { status: 404 }
      );
    }

    if (
      dispute.status !== "OPEN" &&
      dispute.status !== "UNDER_REVIEW"
    ) {
      return NextResponse.json(
        {
          message:
            "Dispute is already resolved",
        },
        { status: 400 }
      );
    }

    if (!dispute.milestone.escrow) {
      return NextResponse.json(
        {
          message:
            "Escrow not found",
        },
        { status: 400 }
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const updatedDispute =
            await tx.dispute.update({
              where: {
                id: disputeId,
              },
              data: {
                status: "RESOLVED",
                resolution:
                  decision,
                resolutionNote:
                  typeof note ===
                    "string" &&
                  note.trim()
                    ? note.trim()
                    : null,
                resolvedAt:
                  new Date(),
                resolvedById:
                  session.user.id,
              },
            });

          const milestoneStatus =
            decision === "CLIENT_WON"
              ? "REFUNDED"
              : "APPROVED";

          const updatedMilestone =
            await tx.milestone.update({
              where: {
                id: dispute.milestone.id,
              },
              data: {
                status:
                  milestoneStatus,
              },
            });

          return {
            dispute:
              updatedDispute,
            milestone:
              updatedMilestone,
          };
        }
      );

    return NextResponse.json({
      success: true,
      message:
        "Dispute resolved successfully",
      ...result,
    });
  } catch (error) {
    console.error(
      "Resolve dispute error:",
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