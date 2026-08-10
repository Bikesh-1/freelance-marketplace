import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  try {
    const { milestoneId } =
      await params;

    const body = await req.json();

    const {
      contractAddress,
      amount,
    } = body;

    const escrow =
      await prisma.escrow.create({
        data: {
          jobId: body.jobId,
          contractAddress,
          amount,
          network: "hardhat-local",
          status: "FUNDED",
        },
      });

    await prisma.milestone.update({
      where: {
        id: milestoneId,
      },

      data: {
        status: "FUNDED",
        escrowId: escrow.id,
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