import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Only clients can create escrow" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }
    const jobId =
      body && typeof body === "object" && !Array.isArray(body) &&
      typeof (body as Record<string, unknown>).jobId === "string"
        ? ((body as Record<string, string>).jobId).trim()
        : "";
    if (!jobId || jobId.length > 128) {
      return NextResponse.json({ message: "A valid job ID is required" }, { status: 400 });
    }

    const contractAddress = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS?.trim() || "";
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      return NextResponse.json({ message: "Escrow contract is not configured on this server" }, { status: 503 });
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!clientProfile) {
      return NextResponse.json({ message: "Client profile not found" }, { status: 404 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, clientId: true, status: true, selectedFreelancerId: true },
    });
    if (!job || job.clientId !== clientProfile.id) {
      return NextResponse.json({ message: "Job not found or access denied" }, { status: 404 });
    }
    if (job.status !== "IN_PROGRESS" || !job.selectedFreelancerId) {
      return NextResponse.json({ message: "Select a freelancer before creating escrow" }, { status: 409 });
    }

    const existingEscrow = await prisma.escrow.findFirst({
      where: { jobId },
      orderBy: { createdAt: "desc" },
    });
    if (existingEscrow) {
      return NextResponse.json({ success: true, escrow: existingEscrow, existing: true });
    }

    const acceptedApplication = await prisma.application.findFirst({
      where: {
        jobId,
        freelancerId: job.selectedFreelancerId,
        status: "ACCEPTED",
      },
      select: { proposedBudget: true },
    });
    if (!acceptedApplication || !Number.isFinite(acceptedApplication.proposedBudget) || acceptedApplication.proposedBudget <= 0) {
      return NextResponse.json({ message: "Accepted application with a valid budget was not found" }, { status: 409 });
    }

    const escrow = await prisma.escrow.create({
      data: {
        jobId,
        contractAddress,
        amount: acceptedApplication.proposedBudget,
        network: process.env.BLOCKCHAIN_NETWORK || "hardhat-local",
        status: "CREATED",
      },
    });

    return NextResponse.json({ success: true, escrow }, { status: 201 });
  } catch (error) {
    console.error("Create escrow error:", error);
    return NextResponse.json({ message: "Unable to create escrow" }, { status: 500 });
  }
}
