import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@/app/generated/prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/blockchain/verifyTransaction";
import { getServerProvider } from "@/lib/blockchain/provider";
import { escrowAbi } from "@/lib/blockchain/escrowAbi";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Only clients can refund escrow" }, { status: 403 });
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
    if (!escrowId || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json({ message: "Valid escrow ID and transaction hash are required" }, { status: 400 });
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, user: { select: { walletAddress: true } } },
    });
    if (!clientProfile) return NextResponse.json({ message: "Client profile not found" }, { status: 404 });
    if (!clientProfile.user.walletAddress) {
      return NextResponse.json({ message: "Connect the client wallet first" }, { status: 400 });
    }

    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        milestone: true,
        job: {
          include: {
            client: { select: { id: true, userId: true } },
            selectedFreelancer: { select: { user: { select: { walletAddress: true } } } },
          },
        },
      },
    });
    if (!escrow) return NextResponse.json({ message: "Escrow not found" }, { status: 404 });
    if (escrow.job.client.userId !== session.user.id) {
      return NextResponse.json({ message: "You do not have access to this escrow" }, { status: 403 });
    }
    if (escrow.status !== "FUNDED") {
      return NextResponse.json({ message: "Escrow is not awaiting refund" }, { status: 409 });
    }
    if (escrow.milestone && !["FUNDED", "DISPUTED"].includes(escrow.milestone.status)) {
      return NextResponse.json({ message: "This milestone is not eligible for refund" }, { status: 409 });
    }
    if (escrow.blockchainEscrowId === null || !ethers.isAddress(escrow.contractAddress)) {
      return NextResponse.json({ message: "Escrow is missing its verified blockchain ID or contract address" }, { status: 409 });
    }

    const { receipt, transaction } = await verifyTransaction(txHash);
    if (!transaction.to ||
        transaction.to.toLowerCase() !== escrow.contractAddress.toLowerCase() ||
        transaction.from.toLowerCase() !== clientProfile.user.walletAddress.toLowerCase()) {
      return NextResponse.json({ message: "Transaction sender or contract does not match this escrow" }, { status: 400 });
    }

    const iface = new ethers.Interface(escrowAbi);
    let parsedTransaction: ethers.TransactionDescription | null = null;
    try {
      parsedTransaction = iface.parseTransaction({ data: transaction.data, value: transaction.value });
    } catch {
      parsedTransaction = null;
    }
    if (!parsedTransaction || parsedTransaction.name !== "refundClient" ||
        BigInt(parsedTransaction.args[0].toString()) !== BigInt(escrow.blockchainEscrowId)) {
      return NextResponse.json({ message: "Transaction does not refund this blockchain escrow" }, { status: 400 });
    }

    const refundedEvent = receipt.logs
      .filter((log) => log.address.toLowerCase() === escrow.contractAddress.toLowerCase())
      .map((log) => {
        try { return iface.parseLog({ topics: [...log.topics], data: log.data }); }
        catch { return null; }
      })
      .find((event) => event?.name === "PaymentRefunded" &&
        BigInt(event.args[0].toString()) === BigInt(escrow.blockchainEscrowId!) &&
        event.args[1].toLowerCase() === clientProfile.user.walletAddress!.toLowerCase());

    if (!refundedEvent ||
        Math.abs(Number(ethers.formatEther(refundedEvent.args[2])) - escrow.amount) > 0.000001) {
      return NextResponse.json({ message: "Verified PaymentRefunded event was not found for this escrow amount" }, { status: 400 });
    }

    const chainContract = new ethers.Contract(escrow.contractAddress, escrowAbi, getServerProvider());
    const chainEscrow = await chainContract.getEscrow(escrow.blockchainEscrowId);
    if (
      chainEscrow[0].toLowerCase() !== clientProfile.user.walletAddress.toLowerCase() ||
      Math.abs(Number(ethers.formatEther(chainEscrow[2]))) > 0.000001 ||
      Number(chainEscrow[3]) !== 3
    ) {
      return NextResponse.json({ message: "On-chain escrow refund state does not match" }, { status: 400 });
    }

    const network = process.env.BLOCKCHAIN_NETWORK || escrow.network;
    await prisma.$transaction(async (tx) => {
      const changed = await tx.escrow.updateMany({
        where: { id: escrow.id, status: "FUNDED" },
        data: { status: "REFUNDED", transactionHash: txHash, network },
      });
      if (changed.count !== 1) throw new Error("ESCROW_ALREADY_PROCESSED");

      if (escrow.milestone) {
        const milestoneChanged = await tx.milestone.updateMany({
          where: { id: escrow.milestone.id, status: { in: ["FUNDED", "DISPUTED"] } },
          data: { status: "REFUNDED" },
        });
        if (milestoneChanged.count !== 1) throw new Error("MILESTONE_ALREADY_PROCESSED");
      }

      await tx.escrowTransaction.create({
        data: {
          escrowId: escrow.id,
          type: "REFUNDED",
          transactionHash: txHash,
          amount: escrow.amount,
          fromAddress: transaction.from,
          toAddress: clientProfile.user.walletAddress!,
          network,
        },
      });
      await tx.transaction.create({
        data: {
          escrowId: escrow.id,
          txHash,
          amount: escrow.amount,
          fromAddress: transaction.from,
          toAddress: clientProfile.user.walletAddress!,
          network,
          status: "CONFIRMED",
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
        },
      });
    });

    return NextResponse.json({ success: true, message: "Escrow refund verified and recorded" });
  } catch (error) {
    if (error instanceof Error && error.message === "ESCROW_ALREADY_PROCESSED") {
      return NextResponse.json({ message: "Escrow has already been processed" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "MILESTONE_ALREADY_PROCESSED") {
      return NextResponse.json({ message: "Milestone has already been processed" }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Transaction has already been recorded" }, { status: 409 });
    }
    console.error("Refund escrow error:", error);
    return NextResponse.json({ message: "Unable to verify escrow refund" }, { status: 500 });
  }
}
