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
      return NextResponse.json({ message: "Only clients can fund escrow" }, { status: 403 });
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
    const blockchainEscrowId = Number(input.blockchainEscrowId);
    if (!escrowId || !/^0x[a-fA-F0-9]{64}$/.test(txHash) ||
        !Number.isFinite(amount) || amount <= 0 ||
        !Number.isSafeInteger(blockchainEscrowId) || blockchainEscrowId < 0) {
      return NextResponse.json({ message: "Invalid escrow, amount, blockchain ID, or transaction hash" }, { status: 400 });
    }

    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        job: {
          include: {
            client: {
              select: { userId: true, user: { select: { walletAddress: true } } },
            },
            selectedFreelancer: {
              select: { user: { select: { walletAddress: true } } },
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

    const expectedClientWallet = escrow.job.client.user.walletAddress;
    const expectedFreelancerWallet = escrow.job.selectedFreelancer?.user.walletAddress;
    if (!expectedClientWallet || !expectedFreelancerWallet) {
      return NextResponse.json({ message: "Client and selected freelancer must connect wallets" }, { status: 400 });
    }

    const { receipt, transaction } = await verifyTransaction(txHash);
    if (
      !transaction.to ||
      transaction.to.toLowerCase() !== escrow.contractAddress.toLowerCase() ||
      transaction.from.toLowerCase() !== expectedClientWallet.toLowerCase()
    ) {
      return NextResponse.json({ message: "Transaction sender or destination does not match this escrow" }, { status: 400 });
    }

    const txValue = Number(transaction.value) / 1e18;
    if (!Number.isFinite(txValue) || Math.abs(txValue - amount) > 0.000001) {
      return NextResponse.json({ message: "Transaction value does not match escrow amount" }, { status: 400 });
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
      .filter((log) => log.address.toLowerCase() === escrow.contractAddress.toLowerCase())
      .map((log) => {
        try { return iface.parseLog({ topics: [...log.topics], data: log.data }); }
        catch { return null; }
      })
      .find((event) => event?.name === "EscrowFunded" &&
        BigInt(event.args[0].toString()) === BigInt(blockchainEscrowId));

    if (!fundedEvent ||
        Math.abs(Number(ethers.formatEther(fundedEvent.args[1])) - escrow.amount) > 0.000001) {
      return NextResponse.json({ message: "Verified funding event was not found for this escrow amount" }, { status: 400 });
    }

    const chainContract = new ethers.Contract(escrow.contractAddress, escrowAbi, getServerProvider());
    const chainEscrow = await chainContract.getEscrow(blockchainEscrowId);
    if (
      chainEscrow[0].toLowerCase() !== expectedClientWallet.toLowerCase() ||
      chainEscrow[1].toLowerCase() !== expectedFreelancerWallet.toLowerCase() ||
      Math.abs(Number(ethers.formatEther(chainEscrow[2])) - escrow.amount) > 0.000001 ||
      Number(chainEscrow[3]) !== 1
    ) {
      return NextResponse.json({ message: "On-chain escrow parties, amount, or status do not match" }, { status: 400 });
    }

    if (await prisma.transaction.findFirst({ where: { txHash }, select: { id: true } })) {
      return NextResponse.json({ message: "Transaction already processed" }, { status: 409 });
    }

    const network = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK || "hardhat-local";
    const updated = await prisma.$transaction(async (tx) => {
      const changed = await tx.escrow.updateMany({
        where: { id: escrowId, status: "CREATED" },
        data: { transactionHash: txHash, blockchainEscrowId, status: "FUNDED", network },
      });
      if (changed.count !== 1) throw new Error("ESCROW_ALREADY_FUNDED");

      await tx.transaction.create({
        data: {
          escrowId,
          txHash,
          amount,
          fromAddress: transaction.from,
          toAddress: transaction.to!,
          network,
          status: "CONFIRMED",
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
        },
      });
      await tx.escrowTransaction.create({
        data: {
          escrowId,
          type: "FUNDED",
          transactionHash: txHash,
          amount,
          fromAddress: transaction.from,
          toAddress: transaction.to!,
          network,
        },
      });
      return tx.escrow.findUnique({ where: { id: escrowId } });
    });

    return NextResponse.json({ success: true, escrow: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "ESCROW_ALREADY_FUNDED") {
      return NextResponse.json({ message: "Escrow has already been funded" }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Transaction already processed" }, { status: 409 });
    }
    console.error("Fund escrow error:", error);
    return NextResponse.json({ message: "Unable to verify escrow funding" }, { status: 500 });
  }
}
