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

    const { transaction } = await verifyTransaction(txHash);
    const existing = await prisma.transaction.findFirst({ where: { txHash } });
    if (existing) return NextResponse.json({ message: "Transaction already processed" }, { status: 409 });

    const expected = amount.toString();
    const txValue = Number(transaction.value) / 1e18;
    if (transaction.to?.toLowerCase() !== profile.user.walletAddress.toLowerCase() ||
        transaction.from.toLowerCase() !== profile.user.walletAddress.toLowerCase() ||
        Math.abs(txValue - Number(expected)) > 0.000001) {
      return NextResponse.json({ message: "Transaction does not match the connected wallet and amount" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.freelancerProfile.update({
        where: { userId: session.user.id },
        data: { walletBalance: { increment: amount } },
      });
      await tx.transaction.create({
        data: {
          amount, txHash, fromAddress: transaction.from,
          toAddress: transaction.to!, network: "hardhat-local", status: "CONFIRMED",
        },
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wallet deposit error:", error);
    return NextResponse.json({ message: "Unable to verify deposit transaction" }, { status: 400 });
  }
}
