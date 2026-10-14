import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/blockchain/verifyTransaction";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Only clients can fund escrow" }, { status: 403 });
    }

    const body = await req.json();
    const escrowId = typeof body.escrowId === "string" ? body.escrowId.trim() : "";
    const txHash = typeof body.txHash === "string" ? body.txHash.trim() : "";
    const amount = Number(body.amount);
    if (!escrowId || !/^0x[a-fA-F0-9]{64}$/.test(txHash) || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: "Invalid escrow, amount, or transaction hash" }, { status: 400 });
    }

    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        job: {
          include: {
            client: {
              select: {
                userId: true,
                user: { select: { walletAddress: true } },
              },
            },
          },
        },
      },
    });
    if (!escrow) return NextResponse.json({ message: "Escrow not found" }, { status: 404 });
    if (escrow.job.client.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (escrow.status !== "CREATED") {
      return NextResponse.json({ message: "Escrow is not awaiting funding" }, { status: 409 });
    }
    if (Math.abs(amount - escrow.amount) > 0.000001) {
      return NextResponse.json({ message: "Funding amount does not match escrow amount" }, { status: 400 });
    }

    const expectedWallet = escrow.job.client.user.walletAddress;
    if (!expectedWallet) {
      return NextResponse.json({ message: "Connect a wallet before funding escrow" }, { status: 400 });
    }

    const { receipt, transaction } = await verifyTransaction(txHash);
    if (receipt.status !== 1) {
      return NextResponse.json({ message: "Blockchain transaction failed" }, { status: 400 });
    }

    const txValue = Number(transaction.value) / 1e18;
    if (
      !transaction.to ||
      transaction.to.toLowerCase() !== escrow.contractAddress.toLowerCase() ||
      transaction.from.toLowerCase() !== expectedWallet.toLowerCase() ||
      !Number.isFinite(txValue) ||
      Math.abs(txValue - amount) > 0.000001
    ) {
      return NextResponse.json(
        { message: "Transaction sender, destination, or amount does not match this escrow" },
        { status: 400 }
      );
    }

    const duplicate = await prisma.transaction.findFirst({ where: { txHash } });
    if (duplicate) {
      return NextResponse.json({ message: "Transaction already processed" }, { status: 409 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const changed = await tx.escrow.updateMany({
        where: { id: escrowId, status: "CREATED" },
        data: { transactionHash: txHash, status: "FUNDED" },
      });
      if (changed.count !== 1) throw new Error("Escrow has already been funded");

      await tx.transaction.create({
        data: {
          escrowId,
          txHash,
          amount,
          fromAddress: transaction.from,
          toAddress: transaction.to!,
          network: process.env.BLOCKCHAIN_NETWORK || "hardhat-local",
          status: "CONFIRMED",
        },
      });
      return tx.escrow.findUnique({ where: { id: escrowId } });
    });

    return NextResponse.json({ success: true, escrow: updated });
  } catch (error) {
    console.error("Fund escrow error:", error);
    return NextResponse.json({ message: "Unable to verify escrow funding" }, { status: 400 });
  }
}
