import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/blockchain/verifyTransaction";
import { escrowAbi } from "@/lib/blockchain/escrowAbi";

function getNetworkLabel(chainId: bigint): string {
  if (chainId === 11155111n) return "sepolia";
  if (chainId === 31337n) return "hardhat-local";
  return `chain-${chainId.toString()}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Only clients can release payments" }, { status: 403 });
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
    const escrowId = typeof input.escrowId === "string" ? input.escrowId.trim() : "";
    const txHash = typeof input.txHash === "string" ? input.txHash.trim() : "";
    const amount = Number(input.amount);
    const fromAddress = typeof input.fromAddress === "string" ? input.fromAddress.trim() : "";
    const toAddress = typeof input.toAddress === "string" ? input.toAddress.trim() : "";

    if (!escrowId || !/^0x[a-fA-F0-9]{64}$/.test(txHash) ||
        !Number.isFinite(amount) || amount <= 0 ||
        !ethers.isAddress(fromAddress) || !ethers.isAddress(toAddress)) {
      return NextResponse.json({ message: "Invalid escrow, transaction, amount, or wallet address" }, { status: 400 });
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

    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        milestone: {
          include: {
            job: {
              include: {
                selectedFreelancer: { select: { user: { select: { walletAddress: true } } } },
              },
            },
          },
        },
      },
    });
    if (!escrow) return NextResponse.json({ message: "Escrow not found" }, { status: 404 });
    if (escrow.milestone?.job.clientId !== clientProfile.id) {
      return NextResponse.json({ message: "You do not have access to this escrow" }, { status: 403 });
    }
    if (!escrow.milestone) {
      return NextResponse.json({ message: "Milestone escrow not found" }, { status: 404 });
    }
    if (escrow.milestone?.status !== "APPROVED" || escrow.status !== "FUNDED") {
      return NextResponse.json({ message: "Only funded escrows with approved milestones can be released" }, { status: 409 });
    }
    if (escrow.blockchainEscrowId === null || !ethers.isAddress(escrow.contractAddress)) {
      return NextResponse.json({ message: "Escrow is missing its verified blockchain ID or contract address" }, { status: 409 });
    }

    const freelancerWallet = escrow.milestone.job.selectedFreelancer?.user.walletAddress;
    if (!freelancerWallet) {
      return NextResponse.json({ message: "Selected freelancer has no connected wallet" }, { status: 409 });
    }
    if (fromAddress.toLowerCase() !== clientProfile.user.walletAddress.toLowerCase() ||
        toAddress.toLowerCase() !== freelancerWallet.toLowerCase()) {
      return NextResponse.json({ message: "Client or freelancer wallet does not match this job" }, { status: 400 });
    }

    const { receipt, transaction, chainId } = await verifyTransaction(txHash);
    const network = getNetworkLabel(chainId);
    if (!transaction.to || transaction.to.toLowerCase() !== escrow.contractAddress.toLowerCase() ||
        transaction.from.toLowerCase() !== clientProfile.user.walletAddress.toLowerCase()) {
      return NextResponse.json({ message: "Transaction contract or sender does not match this escrow" }, { status: 400 });
    }

    const iface = new ethers.Interface(escrowAbi);
    let parsedTransaction: ethers.TransactionDescription | null = null;
    try {
      parsedTransaction = iface.parseTransaction({ data: transaction.data, value: transaction.value });
    } catch {
      parsedTransaction = null;
    }
    if (!parsedTransaction || parsedTransaction.name !== "releasePayment" ||
        BigInt(parsedTransaction.args[0].toString()) !== BigInt(escrow.blockchainEscrowId)) {
      return NextResponse.json({ message: "Transaction does not release this blockchain escrow" }, { status: 400 });
    }

    const releasedEvent = receipt.logs
      .filter((log) => log.address.toLowerCase() === escrow.contractAddress.toLowerCase())
      .map((log) => {
        try { return iface.parseLog({ topics: [...log.topics], data: log.data }); }
        catch { return null; }
      })
      .find((event) => event?.name === "PaymentReleased" &&
        BigInt(event.args[0].toString()) === BigInt(escrow.blockchainEscrowId!) &&
        event.args[1].toLowerCase() === freelancerWallet.toLowerCase());

    if (!releasedEvent) {
      return NextResponse.json({ message: "Successful PaymentReleased event for this freelancer was not found" }, { status: 400 });
    }

    const eventAmount = Number(ethers.formatEther(releasedEvent.args[2]));
    if (!Number.isFinite(eventAmount) ||
        Math.abs(amount - escrow.amount) > 0.000001 ||
        Math.abs(eventAmount - escrow.amount) > 0.000001) {
      return NextResponse.json({ message: "Release amount does not match the verified escrow event" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const escrowChanged = await tx.escrow.updateMany({
        where: { id: escrow.id, status: "FUNDED" },
        data: { transactionHash: txHash, status: "RELEASED", network },
      });
      if (escrowChanged.count !== 1) throw new Error("ESCROW_ALREADY_PROCESSED");

      const milestoneChanged = await tx.milestone.updateMany({
        where: { id: escrow.milestone!.id, status: "APPROVED" },
        data: { status: "RELEASED" },
      });
      if (milestoneChanged.count !== 1) throw new Error("MILESTONE_ALREADY_PROCESSED");

      await tx.escrowTransaction.create({
        data: {
          escrowId: escrow.id,
          type: "RELEASED",
          transactionHash: txHash,
          amount: eventAmount,
          fromAddress: transaction.from,
          toAddress: freelancerWallet,
          network,
        },
      });
      await tx.transaction.create({
        data: {
          escrowId: escrow.id,
          txHash,
          amount: eventAmount,
          fromAddress: transaction.from,
          toAddress: freelancerWallet,
          network,
          status: "CONFIRMED",
          blockNumber: receipt.blockNumber,
        },
      });

      return {
        escrow: await tx.escrow.findUnique({ where: { id: escrow.id } }),
        milestone: await tx.milestone.findUnique({ where: { id: escrow.milestone!.id } }),
      };
    });

    // Mark the job complete only after every milestone's payment has been released.
    const remainingMilestones = await prisma.milestone.count({
      where: {
        jobId: escrow.milestone!.jobId,
        status: { not: "RELEASED" },
      },
    });
    const jobCompleted = remainingMilestones === 0;
    if (jobCompleted) {
      await prisma.job.updateMany({
        where: { id: escrow.milestone!.jobId, status: { not: "COMPLETED" } },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment released successfully",
      escrow: result.escrow,
      milestone: result.milestone,
      jobCompleted,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ESCROW_ALREADY_PROCESSED") {
      return NextResponse.json({ message: "Escrow has already been processed" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "MILESTONE_ALREADY_PROCESSED") {
      return NextResponse.json({ message: "Milestone has already been processed" }, { status: 409 });
    }
    console.error("Release payment error:", error);
    const message = error instanceof Error ? error.message : "Unable to verify payment release";
    return NextResponse.json({ message }, { status: 500 });
  }
}
