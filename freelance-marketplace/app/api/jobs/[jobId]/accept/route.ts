import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { applicationId } = body;

    const clientProfile = await prisma.clientProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!clientProfile) {
      return NextResponse.json(
        { message: "Client profile not found" },
        { status: 404 }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id: params.jobId,
      },
    });

    if (!job || job.clientId !== clientProfile.id) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status: "ACCEPTED",
      },
    });

    await prisma.application.updateMany({
      where: {
        jobId: params.jobId,
        id: {
          not: applicationId,
        },
      },
      data: {
        status: "REJECTED",
      },
    });

    await prisma.job.update({
      where: {
        id: params.jobId,
      },
      data: {
        status: "IN_PROGRESS",
        selectedFreelancerId:
          application.freelancerId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Freelancer selected successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}