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
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Only freelancer can submit
    if (session.user.role !== "FREELANCER") {
      return NextResponse.json(
        {
          message:
            "Only freelancers can submit milestone work",
        },
        { status: 403 }
      );
    }

    // 3. Get freelancer profile
    const freelancerProfile =
      await prisma.freelancerProfile.findUnique({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      });

    if (!freelancerProfile) {
      return NextResponse.json(
        {
          message: "Freelancer profile not found",
        },
        { status: 404 }
      );
    }

    // 4. Get milestone + job
    const milestone =
      await prisma.milestone.findUnique({
        where: {
          id: milestoneId,
        },
        include: {
          job: {
            select: {
              id: true,
              selectedFreelancerId: true,
            },
          },
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

    // 5. Verify freelancer assignment
    if (
      milestone.job.selectedFreelancerId !==
      freelancerProfile.id
    ) {
      return NextResponse.json(
        {
          message:
            "You are not assigned to this job",
        },
        { status: 403 }
      );
    }

    // 6. Only FUNDED milestone can be submitted
    if (milestone.status !== "FUNDED") {
      return NextResponse.json(
        {
          message:
            "Only funded milestones can be submitted",
        },
        { status: 400 }
      );
    }

    // 7. Request body
    const body = await req.json();

    const {
      submissionUrl,
      submissionNote,
    } = body;

    // 8. Validate submission URL
    if (
      typeof submissionUrl !== "string" ||
      !submissionUrl.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Submission URL is required",
        },
        { status: 400 }
      );
    }

    // 9. Validate URL
    try {
      new URL(submissionUrl);
    } catch {
      return NextResponse.json(
        {
          message:
            "Invalid submission URL",
        },
        { status: 400 }
      );
    }

    // 10. Update milestone
    const updatedMilestone =
      await prisma.milestone.update({
        where: {
          id: milestoneId,
        },
        data: {
          status: "SUBMITTED",
          submissionUrl:
            submissionUrl.trim(),
          submissionNote:
            typeof submissionNote ===
              "string" &&
            submissionNote.trim()
              ? submissionNote.trim()
              : null,
        },
        include: {
          escrow: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Milestone submitted successfully",
        milestone: updatedMilestone,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Submit milestone error:",
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