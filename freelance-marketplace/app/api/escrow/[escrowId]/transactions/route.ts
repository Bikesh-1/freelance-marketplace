import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      escrowId: string;
    }>;
  }
) {
  try {
    const { escrowId } =
      await params;

    const transactions =
      await prisma.escrowTransaction.findMany({
        where: {
          escrowId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error(
      "Transaction history error:",
      error
    );

    return NextResponse.json(
      {
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}