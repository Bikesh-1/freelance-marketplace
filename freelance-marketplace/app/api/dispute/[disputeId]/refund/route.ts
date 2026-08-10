import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ disputeId: string }> }
) {
  try {
    const { disputeId } = await params;

    const dispute =
      await prisma.dispute.findUnique({
        where: { id: disputeId },
        include: {
          milestone: {
            include: {
              escrow: true,
            },
          },
        },
      });

    if (!dispute) {
      return NextResponse.json(
        { message: "Dispute not found" },
        { status: 404 }
      );
    }

    await prisma.dispute.update({
      where: { id: disputeId },

      data: {
        status: "CLIENT_WON",
        resolvedAt: new Date(),
      },
    });

    await prisma.milestone.update({
      where: {
        id: dispute.milestoneId,
      },

      data: {
        status: "REFUNDED",
      },
    });

    if (dispute.milestone.escrowId) {
      await prisma.escrow.update({
        where: {
          id: dispute.milestone.escrowId,
        },

        data: {
          status: "REFUNDED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      escrowId:
        dispute.milestone.escrowId,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}