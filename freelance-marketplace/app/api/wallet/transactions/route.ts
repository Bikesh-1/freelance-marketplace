import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session =
      await getServerSession(authOptions);

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

    const transactions =
      await prisma.walletTransaction.findMany({
        where: {
          userId: session.user.id,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 50,
      });

    return NextResponse.json({
      transactions,
    });
  } catch (error) {
    console.error(
      "Wallet transactions error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load wallet transactions",
      },
      {
        status: 500,
      }
    );
  }
}