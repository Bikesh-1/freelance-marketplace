import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const milestones =
  await prisma.milestone.findMany({
    where: {
      jobId,
    },

    orderBy: {
      order: "asc",
    },

    include: {
      escrow: true,
    },
  });

    return NextResponse.json({
      milestones,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}