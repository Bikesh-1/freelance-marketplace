import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@/app/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/blockchain/verifyTransaction";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const depositAddress = process.env.WALLET_DEPOSIT_ADDRESS?.trim();
    if (!depositAddress || !/^0x[a-fA-F0-9]{40}$/.test(depositAddress)) {
      return NextResponse.json({ message: "Wallet deposits are not configured on this server" }, { status: 503 });
    }
    if (session.user.role !== "FREELANCER") {
      return NextResponse.json({ message: "Only freelancers can deposit to the platform wallet" }, { status: 403 });
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
    const amount = Number(input.amount);
    const txHash = typeof input.txHash === "string" ? input.txHash.trim() : "";
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000 ||
        !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json({ message: "Invalid amount or transaction hash" }, { status: 400 });
    }

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { walletAddress: true } } },
    });
    if (!profile) {
      return NextResponse.json({ message: "Freelancer profile not found" }, { status: 404 });
    }
    if (!profile.user.walletAddress) {
      return NextResponse.json({ message: "Connect a wallet first" }, { status: 400 });
    }

    const { receipt, transaction } = await verifyTransaction(txHash);
    if (
      transaction.from.toLowerCase() !== profile.user.walletAddress.toLowerCase() ||
      !transaction.to ||
      transaction.to.toLowerCase() !== depositAddress.toLowerCase()
    ) {
      return NextResponse.json({ message: "Transaction sender or deposit destination does not match" }, { status: 400 });
    }

    const txValue = Number(transaction.value) / 1e18;
    if (!Number.isFinite(txValue) || Math.abs(txValue - amount) > 0.000001) {
      return NextResponse.json({ message: "Transaction amount does not match" }, { status: 400 });
    }

    const existing = await prisma.walletTransaction.findUnique({ where: { txHash }, select: { id: true } });
    if (existing || await prisma.transaction.findFirst({ where: { txHash }, select: { id: true } })) {
      return NextResponse.json({ message: "Transaction already processed" }, { status: 409 });
    }

    const network = process.env.BLOCKCHAIN_NETWORK || "hardhat-local";
    await prisma.$transaction(async (tx) => {
      const changed = await tx.freelancerProfile.updateMany({
        where: { userId: session.user.id },
        data: { walletBalance: { increment: amount } },
      });
      if (changed.count !== 1) throw new Error("FREELANCER_PROFILE_NOT_FOUND");

      await tx.transaction.create({
        data: {
          amount,
          txHash,
          fromAddress: transaction.from,
          toAddress: transaction.to!,
          network,
          status: "CONFIRMED",
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
        },
      });
      await tx.walletTransaction.create({
        data: {
          userId: session.user.id,
          txHash,
          amount,
          type: "DEPOSIT",
          network,
          walletAddress: profile.user.walletAddress!,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Transaction already processed" }, { status: 409 });
    }
    console.error("Wallet deposit error:", error);
    return NextResponse.json({ message: "Unable to verify deposit transaction" }, { status: 400 });
  }
}
