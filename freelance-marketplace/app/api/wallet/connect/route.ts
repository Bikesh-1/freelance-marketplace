import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest
) {
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

    const body = await req.json();

    const walletAddress =
      body.walletAddress;

    if (
      !walletAddress ||
      !/^0x[a-fA-F0-9]{40}$/.test(
        walletAddress
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid wallet address",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser =
      await prisma.user.findFirst({
        where: {
          walletAddress,
        },
      });

    if (
      existingUser &&
      existingUser.id !== session.user.id
    ) {
      return NextResponse.json(
        {
          message:
            "Wallet is already connected to another account",
        },
        {
          status: 409,
        }
      );
    }

    const user =
      await prisma.user.update({
        where: {
          id: session.user.id,
        },

        data: {
          walletAddress,
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
      "Wallet connect error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to connect wallet",
      },
      {
        status: 500,
      }
    );
  }
}