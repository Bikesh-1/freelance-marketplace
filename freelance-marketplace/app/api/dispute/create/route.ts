import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const dispute = await prisma.dispute.create({
      data: {
        milestoneId: body.milestoneId,
        openedById: body.userId,
        reason: body.reason,
        evidence: body.evidence,
      },
    });

    await prisma.milestone.update({
      where: { id: body.milestoneId },
      data: { status: "SUBMITTED" },
    });

    return NextResponse.json({
      success: true,
      dispute,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}