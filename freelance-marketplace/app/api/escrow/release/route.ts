import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      escrowId,
      txHash,
      amount,
      fromAddress,
      toAddress,
    } = body;

    const escrow =
      await prisma.escrow.update({
        where: {
          id: escrowId,
        },

        data: {
          transactionHash: txHash,
          status: "RELEASED",
        },
      });

    await prisma.transaction.create({
      data: {
        escrowId,
        txHash,
        amount,
        fromAddress,
        toAddress,
        network: "hardhat-local",
        status: "CONFIRMED",
      },
    });

    await prisma.milestone.update({
      where: {
        escrowId: escrowId,
      },

      data: {
        status: "RELEASED",
      },
    });

    return NextResponse.json({
      success: true,
      escrow,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}