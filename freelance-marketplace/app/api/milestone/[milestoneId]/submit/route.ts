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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "FREELANCER") {
      return NextResponse.json({ message: "Only freelancers can submit milestone work" }, { status: 403 });
    }

    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!freelancerProfile) {
      return NextResponse.json({ message: "Freelancer profile not found" }, { status: 404 });
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { job: { select: { id: true, selectedFreelancerId: true } } },
    });

    if (!milestone) {
      return NextResponse.json({ message: "Milestone not found" }, { status: 404 });
    }

    if (milestone.job.selectedFreelancerId !== freelancerProfile.id) {
      return NextResponse.json({ message: "You are not assigned to this job" }, { status: 403 });
    }

    if (milestone.status !== "FUNDED") {
      return NextResponse.json({ message: "Only funded milestones can be submitted" }, { status: 400 });
    }

    const body = await req.json();
    const submissionUrl = typeof body.submissionUrl === "string" ? body.submissionUrl.trim() : "";
    const submissionNote = typeof body.submissionNote === "string" ? body.submissionNote.trim() : "";

    // A submission may contain a project URL, an uploaded Cloudinary file, or both.
    if (!submissionUrl) {
      return NextResponse.json(
        { message: "Submission URL or an uploaded work file is required" },
        { status: 400 }
      );
    }

    try {
      const parsedUrl = new URL(submissionUrl);
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        throw new Error("Unsupported URL protocol");
      }
    } catch {
      return NextResponse.json({ message: "Invalid submission URL" }, { status: 400 });
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: "SUBMITTED",
        submissionUrl,
        submissionNote: submissionNote || null,
        submittedAt: new Date(),
      },
      include: { escrow: true },
    });

    return NextResponse.json({
      success: true,
      message: "Milestone submitted successfully",
      milestone: updatedMilestone,
    });
  } catch (error) {
    console.error("Submit milestone error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
