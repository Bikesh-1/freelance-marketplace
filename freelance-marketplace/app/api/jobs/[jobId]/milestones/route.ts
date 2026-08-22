import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    // Authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Get job
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        id: true,
        clientId: true,
        selectedFreelancerId: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          message: "Job not found",
        },
        { status: 404 }
      );
    }

    // CLIENT authorization
    if (session.user.role === "CLIENT") {
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

      if (job.clientId !== clientProfile.id) {
        return NextResponse.json(
          {
            message:
              "You do not have access to this job",
          },
          { status: 403 }
        );
      }
    }

    // FREELANCER authorization
    else if (session.user.role === "FREELANCER") {
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
            message:
              "Freelancer profile not found",
          },
          { status: 404 }
        );
      }

      if (
        job.selectedFreelancerId !==
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
    }

    // Invalid role
    else {
      return NextResponse.json(
        {
          message: "Invalid user role",
        },
        { status: 403 }
      );
    }

    // Fetch milestones after authorization
    const milestones =
      await prisma.milestone.findMany({
        where: {
          jobId: job.id,
        },
        orderBy: {
          order: "asc",
        },
        include: {
          escrow: true,
        },
      });

    return NextResponse.json({
      success: true,
      milestones,
    });
  } catch (error) {
    console.error(
      "Get milestones error:",
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