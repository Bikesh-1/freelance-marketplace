import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  try {
    const { milestoneId } = await params;

    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: "SUBMITTED" },
    });

    return NextResponse.json({
      success: true,
      milestone,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}