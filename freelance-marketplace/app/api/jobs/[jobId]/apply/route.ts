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

    if (session.user.role !== "FREELANCER") {
      return NextResponse.json(
        { message: "Only freelancers can apply" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const profile = await prisma.freelancerProfile.findUnique({
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

    const existing = await prisma.application.findUnique({
      where: {
        jobId_freelancerId: {
          jobId: params.jobId,
          freelancerId: profile.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Already applied" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        jobId: params.jobId,
        freelancerId: profile.id,
        coverLetter: body.coverLetter,
        proposedBudget: Number(body.proposedBudget),
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}