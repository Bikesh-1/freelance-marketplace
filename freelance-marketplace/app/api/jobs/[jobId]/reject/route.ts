import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
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
        id: jobId,
      },
    });

    if (!job || job.clientId !== clientProfile.id) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status: "REJECTED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Application rejected successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}
