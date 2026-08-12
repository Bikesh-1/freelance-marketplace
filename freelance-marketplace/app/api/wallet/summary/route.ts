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

    const freelancer =
      await prisma.freelancerProfile.findUnique({
        where: {
          userId,
        },
      });

    const client =
      await prisma.clientProfile.findUnique(
        {
          where: {
            userId,
          },
        }
      );

    const wallet =
      freelancer?.walletBalance || 0;

    const escrowBalance =
      await prisma.escrow.aggregate({
        where: {
          status: "FUNDED",
        },

        _sum: {
          amount: true,
        },
      });

    const earnings =
      await prisma.transaction.aggregate({
        where: {
          toAddress: userId,
        },

        _sum: {
          amount: true,
        },
      });

    const spent =
      await prisma.transaction.aggregate({
        where: {
          fromAddress: userId,
        },

        _sum: {
          amount: true,
        },
      });

    return NextResponse.json({
      walletBalance: wallet,
      escrowBalance:
        escrowBalance._sum.amount ||
        0,
      totalEarnings:
        earnings._sum.amount || 0,
      totalSpent:
        spent._sum.amount || 0,
      clientId: client?.id || null,
      freelancerId:
        freelancer?.id || null,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}