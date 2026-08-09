import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    const applications = await prisma.application.findMany({
      where: {
        jobId: params.jobId,
      },
      include: {
        freelancer: {
          include: {
            user: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}