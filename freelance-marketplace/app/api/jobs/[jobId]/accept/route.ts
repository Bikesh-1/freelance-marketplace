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
    if (session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Only clients can accept applications" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }
    const applicationId =
      body && typeof body === "object" && !Array.isArray(body) &&
      typeof (body as Record<string, unknown>).applicationId === "string"
        ? ((body as Record<string, string>).applicationId).trim()
        : "";
    if (!jobId || !applicationId) {
      return NextResponse.json({ message: "Job ID and application ID are required" }, { status: 400 });
    }

    const contractAddress = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS?.trim() || "";
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      return NextResponse.json(
        { message: "Escrow contract is not configured on this server" },
        { status: 503 }
      );
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!clientProfile) {
      return NextResponse.json({ message: "Client profile not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const job = await tx.job.findUnique({
        where: { id: jobId },
        select: { id: true, clientId: true, status: true, budget: true, selectedFreelancerId: true },
      });
      if (!job || job.clientId !== clientProfile.id) {
        throw new Error("JOB_NOT_FOUND_OR_FORBIDDEN");
      }
      if (job.status !== "OPEN" || job.selectedFreelancerId) {
        throw new Error("JOB_NOT_OPEN");
      }

      const application = await tx.application.findUnique({
        where: { id: applicationId },
        select: { id: true, jobId: true, freelancerId: true, proposedBudget: true, status: true },
      });
      if (!application || application.jobId !== jobId) {
        throw new Error("APPLICATION_NOT_FOUND");
      }
      if (application.status !== "PENDING") {
        throw new Error("APPLICATION_NOT_PENDING");
      }

      const selected = await tx.job.updateMany({
        where: { id: jobId, clientId: clientProfile.id, status: "OPEN", selectedFreelancerId: null },
        data: { status: "IN_PROGRESS", selectedFreelancerId: application.freelancerId },
      });
      if (selected.count !== 1) throw new Error("JOB_NOT_OPEN");

      const accepted = await tx.application.updateMany({
        where: { id: applicationId, jobId, status: "PENDING" },
        data: { status: "ACCEPTED" },
      });
      if (accepted.count !== 1) throw new Error("APPLICATION_NOT_PENDING");

      await tx.application.updateMany({
        where: { jobId, id: { not: applicationId }, status: "PENDING" },
        data: { status: "REJECTED" },
      });

      const escrow = await tx.escrow.create({
        data: {
          jobId,
          contractAddress,
          amount: application.proposedBudget,
          network: process.env.BLOCKCHAIN_NETWORK || "hardhat-local",
          status: "CREATED",
        },
      });
      return { escrow };
    });

    return NextResponse.json({
      success: true,
      message: "Freelancer selected successfully",
      escrow: result.escrow,
    });
  } catch (error) {
    if (error instanceof Error) {
      const knownErrors: Record<string, { status: number; message: string }> = {
        JOB_NOT_FOUND_OR_FORBIDDEN: { status: 404, message: "Job not found or access denied" },
        JOB_NOT_OPEN: { status: 409, message: "Job is no longer accepting applications" },
        APPLICATION_NOT_FOUND: { status: 404, message: "Application not found for this job" },
        APPLICATION_NOT_PENDING: { status: 409, message: "Application is no longer pending" },
      };
      const known = knownErrors[error.message];
      if (known) return NextResponse.json({ message: known.message }, { status: known.status });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "An escrow already exists for this selection" }, { status: 409 });
    }
    console.error("Accept application error:", error);
    return NextResponse.json({ message: "Unable to accept application" }, { status: 500 });
  }
}
