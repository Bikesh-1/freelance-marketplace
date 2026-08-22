import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest
) {
  try {
    // 1. Authentication
    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // 2. Only CLIENT / FREELANCER
    if (
      session.user.role !== "CLIENT" &&
      session.user.role !== "FREELANCER"
    ) {
      return NextResponse.json(
        {
          message:
            "Only clients or freelancers can raise disputes",
        },
        { status: 403 }
      );
    }

    // 3. Request body
    const body = await req.json();

    const {
      milestoneId,
      reason,
      evidence,
    } = body;

    if (
      typeof milestoneId !== "string" ||
      !milestoneId.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Milestone ID is required",
        },
        { status: 400 }
      );
    }

    if (
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Dispute reason is required",
        },
        { status: 400 }
      );
    }

    // 4. Get milestone
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
              selectedFreelancerId: true,
            },
          },
          escrow: true,
        },
      });

    if (!milestone) {
      return NextResponse.json(
        {
          message:
            "Milestone not found",
        },
        { status: 404 }
      );
    }

    // 5. Resolve current user's profile
    let clientProfileId:
      | string
      | null = null;

    let freelancerProfileId:
      | string
      | null = null;

    if (
      session.user.role === "CLIENT"
    ) {
      const profile =
        await prisma.clientProfile.findUnique(
          {
            where: {
              userId: session.user.id,
            },
            select: {
              id: true,
            },
          }
        );

      if (!profile) {
        return NextResponse.json(
          {
            message:
              "Client profile not found",
          },
          { status: 404 }
        );
      }

      clientProfileId = profile.id;
    }

    if (
      session.user.role ===
      "FREELANCER"
    ) {
      const profile =
        await prisma.freelancerProfile.findUnique(
          {
            where: {
              userId: session.user.id,
            },
            select: {
              id: true,
            },
          }
        );

      if (!profile) {
        return NextResponse.json(
          {
            message:
              "Freelancer profile not found",
          },
          { status: 404 }
        );
      }

      freelancerProfileId =
        profile.id;
    }

    // 6. Verify user belongs to this job
    const isClient =
      clientProfileId ===
      milestone.job.clientId;

    const isFreelancer =
      freelancerProfileId ===
      milestone.job
        .selectedFreelancerId;

    if (!isClient && !isFreelancer) {
      return NextResponse.json(
        {
          message:
            "You are not a participant in this job",
        },
        { status: 403 }
      );
    }

    // 7. Only valid milestone states
    if (
      milestone.status !== "FUNDED" &&
      milestone.status !== "SUBMITTED"
    ) {
      return NextResponse.json(
        {
          message:
            "This milestone cannot be disputed in its current state",
        },
        { status: 400 }
      );
    }

    // 8. Escrow must exist
    if (!milestone.escrow) {
      return NextResponse.json(
        {
          message:
            "Escrow not found for this milestone",
        },
        { status: 400 }
      );
    }

    // 9. Prevent duplicate open dispute
    const existingDispute =
      await prisma.dispute.findFirst({
        where: {
          milestoneId,
          status: {
            in: [
              "OPEN",
              "UNDER_REVIEW",
            ],
          },
        },
      });

    if (existingDispute) {
      return NextResponse.json(
        {
          message:
            "An active dispute already exists",
        },
        { status: 400 }
      );
    }

    // 10. Create dispute + freeze milestone
    const result =
      await prisma.$transaction(
        async (tx) => {
          const dispute =
            await tx.dispute.create({
              data: {
                milestoneId,
                openedById:
                  session.user.id,
                reason:
                  reason.trim(),
                evidence:
                  typeof evidence ===
                    "string" &&
                  evidence.trim()
                    ? evidence.trim()
                    : null,
                status: "OPEN",
              },
            });

          const updatedMilestone =
            await tx.milestone.update({
              where: {
                id: milestoneId,
              },
              data: {
                status: "DISPUTED",
              },
            });

          return {
            dispute,
            milestone:
              updatedMilestone,
          };
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Dispute raised successfully",
        dispute: result.dispute,
        milestone:
          result.milestone,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create dispute error:",
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