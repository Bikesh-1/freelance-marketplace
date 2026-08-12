import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User required" },
        { status: 400 }
      );
    }

    const funded =
      await prisma.escrow.aggregate({
        where: {
          status: "FUNDED",
        },

        _sum: {
          amount: true,
        },
      });

    const released =
      await prisma.escrow.aggregate({
        where: {
          status:
            "RELEASED",
        },

        _sum: {
          amount: true,
        },
      });

    const refunded =
      await prisma.escrow.aggregate({
        where: {
          status:
            "REFUNDED",
        },

        _sum: {
          amount: true,
        },
      });

    return NextResponse.json({
      funded:
        funded._sum.amount || 0,

      released:
        released._sum.amount || 0,

      refunded:
        refunded._sum.amount || 0,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}