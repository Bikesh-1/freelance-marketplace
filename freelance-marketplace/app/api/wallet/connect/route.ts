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
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const walletAddress =
      body?.walletAddress?.trim();

    if (!walletAddress) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet address is required",
        },
        {
          status: 400,
        }
      );
    }

    // Normalize wallet address
    const normalizedWalletAddress =
      walletAddress.toLowerCase();

    // --------------------------------------------------
    // CHECK IF WALLET IS ALREADY USED
    // --------------------------------------------------

    const existingUser =
      await prisma.user.findUnique({
        where: {
          walletAddress:
            normalizedWalletAddress,
        },
        select: {
          id: true,
        },
      });

    if (
      existingUser &&
      existingUser.id !== session.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "WALLET_ALREADY_CONNECTED",
          message:
            "This wallet is already connected to another account.",
        },
        {
          status: 409,
        }
      );
    }

    // --------------------------------------------------
    // UPDATE CURRENT USER
    // --------------------------------------------------

    const user =
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          walletAddress:
            normalizedWalletAddress,
        },
        select: {
          id: true,
          walletAddress: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Wallet connected successfully",
        user,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Wallet connect error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to connect wallet",
      },
      {
        status: 500,
      }
    );
  }
}