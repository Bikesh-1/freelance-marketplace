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

    const transactions =
      await prisma.transaction.findMany({
        where: {
          toAddress: userId,
        },

        orderBy: {
          createdAt: "asc",
        },
      });

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result = months.map(
      (month, index) => ({
        month,
        revenue: 0,
      })
    );

    for (const tx of transactions) {
      const month =
        new Date(
          tx.createdAt
        ).getMonth();

      result[month].revenue +=
        tx.amount;
    }

    return NextResponse.json({
      analytics: result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}