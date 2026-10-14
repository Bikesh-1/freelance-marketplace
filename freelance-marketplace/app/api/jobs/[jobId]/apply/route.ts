import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@/app/generated/prisma/client";

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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "FREELANCER") {
      return NextResponse.json({ message: "Only freelancers can apply" }, { status: 403 });
    }
    if (!jobId || jobId.length > 128) {
      return NextResponse.json({ message: "Invalid job ID" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const coverLetter = typeof input.coverLetter === "string" ? input.coverLetter.trim() : "";
    const proposedBudget = Number(input.proposedBudget);
    if (
      coverLetter.length < 10 || coverLetter.length > 5_000 ||
      !Number.isFinite(proposedBudget) || proposedBudget <= 0 || proposedBudget > 10_000_000
    ) {
      return NextResponse.json({ message: "Enter a valid cover letter and proposed budget" }, { status: 400 });
    }

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json({ message: "Freelancer profile not found" }, { status: 404 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, status: true, budget: true, client: { select: { userId: true } } },
    });
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }
    if (job.status !== "OPEN") {
      return NextResponse.json({ message: "This job is no longer accepting applications" }, { status: 409 });
    }
    if (job.client.userId === session.user.id) {
      return NextResponse.json({ message: "You cannot apply to your own job" }, { status: 403 });
    }

    const existing = await prisma.application.findUnique({
      where: { jobId_freelancerId: { jobId, freelancerId: profile.id } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ message: "Already applied" }, { status: 409 });
    }

    const application = await prisma.application.create({
      data: { jobId, freelancerId: profile.id, coverLetter, proposedBudget },
    });
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Already applied" }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Job or profile not found" }, { status: 404 });
    }
    console.error("Apply to job error:", error);
    return NextResponse.json({ message: "Unable to submit application" }, { status: 500 });
  }
}
