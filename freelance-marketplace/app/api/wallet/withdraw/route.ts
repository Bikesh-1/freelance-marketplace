import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/blockchain/verifyTransaction";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const amount = Number(body.amount);
    const txHash = typeof body.txHash === "string" ? body.txHash.trim() : "";
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000 || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json({ message: "Invalid amount or transaction hash" }, { status: 400 });
    }

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { walletAddress: true } } },
    });
    if (!profile) return NextResponse.json({ message: "Freelancer profile not found" }, { status: 404 });
    if (!profile.user.walletAddress) return NextResponse.json({ message: "Connect a wallet first" }, { status: 400 });
    if (profile.walletBalance < amount) return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });

    const { transaction } = await verifyTransaction(txHash);
    if (transaction.from.toLowerCase() !== profile.user.walletAddress.toLowerCase() ||
        Math.abs(Number(transaction.value) / 1e18 - amount) > 0.000001) {
      return NextResponse.json({ message: "Transaction does not match the connected wallet and amount" }, { status: 400 });
    }
    const duplicate = await prisma.transaction.findFirst({ where: { txHash } });
    if (duplicate) return NextResponse.json({ message: "Transaction already processed" }, { status: 409 });

    await prisma.$transaction(async (tx) => {
      const changed = await tx.freelancerProfile.updateMany({
        where: { userId: session.user.id, walletBalance: { gte: amount } },
        data: { walletBalance: { decrement: amount } },
      });
      if (changed.count !== 1) throw new Error("Insufficient balance");
      await tx.transaction.create({
        data: {
          amount, txHash, fromAddress: transaction.from,
          toAddress: transaction.to ?? "", network: "hardhat-local", status: "CONFIRMED",
        },
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wallet withdrawal error:", error);
    return NextResponse.json({ message: "Unable to verify withdrawal transaction" }, { status: 400 });
  }
}
