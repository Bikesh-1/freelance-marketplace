import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");

    const transactions =
      await prisma.transaction.findMany({
        where: {
          OR: [
            {
              fromAddress:
                userId!,
            },

            {
              toAddress:
                userId!,
            },
          ],
        },

        include: {
          escrow: true,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 20,
      });

    return NextResponse.json({
      transactions,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}