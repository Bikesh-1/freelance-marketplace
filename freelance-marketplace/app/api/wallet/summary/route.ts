import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        freelancerProfile: true,
        clientProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const walletBalance =
      user.freelancerProfile?.walletBalance ?? 0;

    const transactions = await prisma.walletTransaction.findMany({
      where: {
        userId,
      },
    });

    const totalReceived = transactions
      .filter(
        (tx) =>
          tx.type === "DEPOSIT" ||
          tx.type === "EARNING"
      )
      .reduce(
        (total, tx) => total + tx.amount,
        0
      );

    const totalSpent = transactions
      .filter(
        (tx) =>
          tx.type === "WITHDRAW" ||
          tx.type === "PAYMENT"
      )
      .reduce(
        (total, tx) => total + tx.amount,
        0
      );

    const escrowTransactions =
      await prisma.transaction.findMany({
        where: {
          escrow: {
            job: {
              client: {
                userId,
              },
            },
          },
        },
      });

    const escrowBalance = escrowTransactions
      .filter(
        (tx) => tx.status === "CONFIRMED"
      )
      .reduce(
        (total, tx) => total + tx.amount,
        0
      );

    return NextResponse.json({
      walletAddress:
        user.walletAddress ?? null,

      walletBalance,

      escrowBalance,

      totalEarnings: totalReceived,

      totalSpent,

      network: "hardhat-local",
    });
  } catch (error) {
    console.error(
      "Wallet summary error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to load wallet summary",
      },
      {
        status: 500,
      }
    );
  }
}