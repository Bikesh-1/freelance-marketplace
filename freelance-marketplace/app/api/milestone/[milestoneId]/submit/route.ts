import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  try {
    const { milestoneId } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "FREELANCER") {
      return NextResponse.json(
        { message: "Only freelancers can submit work" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const submissionNote = body.submissionNote?.trim();
    const submissionUrl = body.submissionUrl?.trim();

    if (!submissionNote && !submissionUrl) {
      return NextResponse.json(
        {
          message:
            "Submission note or work URL is required",
        },
        { status: 400 }
      );
    }

    const profile =
      await prisma.freelancerProfile.findUnique({
        where: {
          userId: session.user.id,
        },
      });

    if (!profile) {
      return NextResponse.json(
        { message: "Freelancer profile not found" },
        { status: 404 }
      );
    }

    const milestone =
      await prisma.milestone.findUnique({
        where: {
          id: milestoneId,
        },
        include: {
          job: true,
        },
      });

    if (!milestone) {
      return NextResponse.json(
        { message: "Milestone not found" },
        { status: 404 }
      );
    }

    if (
      milestone.job.selectedFreelancerId !==
      profile.id
    ) {
      return NextResponse.json(
        {
          message:
            "You are not assigned to this job",
        },
        { status: 403 }
      );
    }

    if (milestone.status !== "FUNDED") {
      return NextResponse.json(
        {
          message:
            "Only funded milestones can be submitted",
        },
        { status: 400 }
      );
    }

    const updatedMilestone =
      await prisma.milestone.update({
        where: {
          id: milestoneId,
        },
        data: {
          status: "SUBMITTED",
          submissionNote:
            submissionNote || null,
          submissionUrl:
            submissionUrl || null,
          submittedAt: new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      milestone: updatedMilestone,
    });
  } catch (error) {
    console.error(
      "Submit milestone error:",
      error
    );

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}