import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const disputes = await prisma.dispute.findMany({
      include: {
        milestone: true,
        openedBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      disputes,
    });
  } catch (error) {
    console.error("GET /api/dispute error:", error);

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