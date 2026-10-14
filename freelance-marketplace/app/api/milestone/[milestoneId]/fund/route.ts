import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@/app/generated/prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/blockchain/verifyTransaction";
import { escrowAbi } from "@/lib/blockchain/escrowAbi";

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
    if (session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Only clients can fund milestones" }, { status: 403 });
    }
    if (!milestoneId || milestoneId.length > 128) {
      return NextResponse.json({ message: "Invalid milestone ID" }, { status: 400 });
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
    const transactionHash = typeof input.transactionHash === "string" ? input.transactionHash.trim() : "";
    const blockchainEscrowId = Number(input.blockchainEscrowId);
    const fundedAmount = Number(input.amount);
    if (!/^0x[a-fA-F0-9]{64}$/.test(transactionHash) ||
        !Number.isSafeInteger(blockchainEscrowId) || blockchainEscrowId < 0 ||
        !Number.isFinite(fundedAmount) || fundedAmount <= 0) {
      return NextResponse.json({ message: "Invalid transaction, escrow ID, or amount" }, { status: 400 });
    }

    const contractAddress = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS?.trim() || "";
    if (!ethers.isAddress(contractAddress)) {
      return NextResponse.json({ message: "Escrow contract is not configured on this server" }, { status: 503 });
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, user: { select: { walletAddress: true } } },
    });
    if (!clientProfile) {
      return NextResponse.json({ message: "Client profile not found" }, { status: 404 });
    }
    if (!clientProfile.user.walletAddress) {
      return NextResponse.json({ message: "Connect the client wallet first" }, { status: 400 });
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        job: { select: { id: true, clientId: true, selectedFreelancerId: true } },
        escrow: true,
      },
    });
    if (!milestone) return NextResponse.json({ message: "Milestone not found" }, { status: 404 });
    if (milestone.job.clientId !== clientProfile.id) {
      return NextResponse.json({ message: "You do not have access to this milestone" }, { status: 403 });
    }
    if (!milestone.job.selectedFreelancerId) {
      return NextResponse.json({ message: "Freelancer is not selected for this job" }, { status: 409 });
    }
    if (milestone.status !== "PENDING" || milestone.escrow) {
      return NextResponse.json({ message: "Milestone is not awaiting funding" }, { status: 409 });
    }
    if (Math.abs(fundedAmount - milestone.amount) > 0.000001) {
      return NextResponse.json({ message: "Funding amount does not match milestone amount" }, { status: 400 });
    }

    const { receipt, transaction } = await verifyTransaction(transactionHash);
    if (
      !transaction.to ||
      transaction.to.toLowerCase() !== contractAddress.toLowerCase() ||
      transaction.from.toLowerCase() !== clientProfile.user.walletAddress.toLowerCase()
    ) {
      return NextResponse.json({ message: "Transaction sender or contract does not match" }, { status: 400 });
    }

    const txAmount = Number(transaction.value) / 1e18;
    if (!Number.isFinite(txAmount) || Math.abs(txAmount - milestone.amount) > 0.000001) {
      return NextResponse.json({ message: "On-chain funding amount does not match milestone amount" }, { status: 400 });
    }

    const iface = new ethers.Interface(escrowAbi);
    let parsedTransaction: ethers.TransactionDescription | null = null;
    try {
      parsedTransaction = iface.parseTransaction({ data: transaction.data, value: transaction.value });
    } catch {
      parsedTransaction = null;
    }
    if (!parsedTransaction || parsedTransaction.name !== "fundEscrow" ||
        BigInt(parsedTransaction.args[0].toString()) !== BigInt(blockchainEscrowId)) {
      return NextResponse.json({ message: "Transaction does not fund the submitted blockchain escrow" }, { status: 400 });
    }

    const fundedEvent = receipt.logs
      .filter((log) => log.address.toLowerCase() === contractAddress.toLowerCase())
      .map((log) => {
        try { return iface.parseLog({ topics: [...log.topics], data: log.data }); }
        catch { return null; }
      })
      .find((event) => event?.name === "EscrowFunded" &&
        BigInt(event.args[0].toString()) === BigInt(blockchainEscrowId));

    if (!fundedEvent ||
        Math.abs(Number(ethers.formatEther(fundedEvent.args[1])) - milestone.amount) > 0.000001) {
      return NextResponse.json({ message: "Verified EscrowFunded event was not found for this milestone amount" }, { status: 400 });
    }

    const network = process.env.BLOCKCHAIN_NETWORK || "hardhat-local";
    const result = await prisma.$transaction(async (tx) => {
      const changed = await tx.milestone.updateMany({
        where: { id: milestoneId, status: "PENDING", escrowId: null },
        data: { status: "FUNDED" },
      });
      if (changed.count !== 1) throw new Error("MILESTONE_ALREADY_FUNDED");

      const escrow = await tx.escrow.create({
        data: {
          jobId: milestone.job.id,
          contractAddress,
          transactionHash,
          amount: milestone.amount,
          blockchainEscrowId,
          network,
          status: "FUNDED",
          milestone: { connect: { id: milestoneId } },
        },
      });
      await tx.escrowTransaction.create({
        data: {
          escrowId: escrow.id,
          type: "FUNDED",
          transactionHash,
          amount: milestone.amount,
          fromAddress: transaction.from,
          toAddress: contractAddress,
          network,
        },
      });
      return { escrow };
    });

    return NextResponse.json({
      success: true,
      message: "Milestone funded successfully",
      escrow: result.escrow,
    }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "MILESTONE_ALREADY_FUNDED") {
      return NextResponse.json({ message: "Milestone has already been funded" }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Escrow or transaction has already been recorded" }, { status: 409 });
    }
    console.error("Fund milestone error:", error);
    return NextResponse.json({ message: "Unable to verify milestone funding" }, { status: 500 });
  }
}
