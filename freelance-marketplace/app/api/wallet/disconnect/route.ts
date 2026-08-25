import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session =
      await getServerSession(
        authOptions
      );

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

    const user =
      await prisma.user.update({
        where: {
          id: session.user.id,
        },

        data: {
          walletAddress: null,
        },

        select: {
          walletAddress: true,
        },
      });

    return NextResponse.json({
      success: true,
      walletAddress:
        user.walletAddress,
    });
  } catch (error) {
    console.error(
      "Wallet disconnect error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to disconnect wallet",
      },
      {
        status: 500,
      }
    );
  }
}