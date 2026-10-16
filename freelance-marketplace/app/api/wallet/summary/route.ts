import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { freelancerProfile: true },
    });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    const totalReceived = transactions
      .filter(tx => tx.type === "DEPOSIT" || tx.type === "EARNING")
      .reduce((total, tx) => total + tx.amount, 0);
    const totalSpent = transactions
      .filter(tx => tx.type === "WITHDRAW" || tx.type === "PAYMENT")
      .reduce((total, tx) => total + tx.amount, 0);

    const escrowFilter = user.role === "CLIENT"
      ? { job: { client: { userId } } }
      : user.role === "FREELANCER"
        ? { job: { selectedFreelancer: { userId } } }
        : undefined;
    const [fundedEscrow, releasedEscrow] = escrowFilter ? await Promise.all([
      prisma.escrow.aggregate({
        where: { ...escrowFilter, status: "FUNDED" },
        _sum: { amount: true },
      }),
      prisma.escrow.aggregate({
        where: { ...escrowFilter, status: "RELEASED" },
        _sum: { amount: true },
      }),
    ]) : [{ _sum: { amount: null } }, { _sum: { amount: null } }];

    return NextResponse.json({
      walletAddress: user.walletAddress ?? null,
      walletBalance: user.freelancerProfile?.walletBalance ?? 0,
      escrowBalance: fundedEscrow._sum.amount ?? 0,
      totalEarnings: user.role === "FREELANCER"
        ? (releasedEscrow._sum.amount ?? totalReceived)
        : totalReceived,
      totalSpent,
      network: process.env.BLOCKCHAIN_NETWORK || process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK || "sepolia",
    });
  } catch (error) {
    console.error("Wallet summary error:", error);
    return NextResponse.json({ message: "Failed to load wallet summary" }, { status: 500 });
  }
}
