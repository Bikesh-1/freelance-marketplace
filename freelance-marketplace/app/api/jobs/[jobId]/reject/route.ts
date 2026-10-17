import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { message: "Only clients can reject applications" },
        { status: 403 }
      );
    }

    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ message: "Job ID is required" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const applicationId =
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      typeof (body as Record<string, unknown>).applicationId === "string"
        ? (body as Record<string, string>).applicationId.trim()
        : "";

    if (!applicationId) {
      return NextResponse.json(
        { message: "Application ID is required" },
        { status: 400 }
      );
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!clientProfile) {
      return NextResponse.json(
        { message: "Client profile not found" },
        { status: 404 }
      );
    }

    const job = await prisma.job.findFirst({
      where: { id: jobId, clientId: clientProfile.id },
      select: { id: true },
    });

    if (!job) {
      return NextResponse.json(
        { message: "Job not found or access denied" },
        { status: 404 }
      );
    }

    const application = await prisma.application.findFirst({
      where: { id: applicationId, jobId },
      select: { id: true, status: true },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Application not found for this job" },
        { status: 404 }
      );
    }

    if (application.status !== "PENDING") {
      return NextResponse.json(
        { message: "Only pending applications can be rejected" },
        { status: 409 }
      );
    }

    const updated = await prisma.application.updateMany({
      where: { id: applicationId, jobId, status: "PENDING" },
      data: { status: "REJECTED" },
    });

    if (updated.count !== 1) {
      return NextResponse.json(
        { message: "Application status changed. Refresh and try again." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application rejected successfully",
    });
  } catch (error) {
    console.error("Reject application error:", error);
    return NextResponse.json(
      { message: "Unable to reject application right now" },
      { status: 500 }
    );
  }
}
