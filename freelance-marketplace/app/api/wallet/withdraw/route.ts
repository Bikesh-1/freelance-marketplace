import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      userId,
      amount,
      txHash,
    } = body;

    const profile =
      await prisma.freelancerProfile.findUnique({
        where: {
          userId,
        },
      });

    if (
      !profile ||
      profile.walletBalance <
        amount
    ) {
      return NextResponse.json(
        {
          message:
            "Insufficient balance",
        },
        { status: 400 }
      );
    }

    await prisma.freelancerProfile.update({
      where: {
        userId,
      },

      data: {
        walletBalance: {
          decrement:
            amount,
        },
      },
    });

    await prisma.transaction.create({
      data: {
        amount,
        txHash,
        fromAddress:
          userId,
        toAddress: userId,
        network:
          "hardhat-local",
        status:
          "CONFIRMED",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}