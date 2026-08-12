import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } =
      await params;

    const body =
      await req.json();

    const { reply } = body;

    const review =
      await prisma.review.update({
        where: {
          id: reviewId,
        },

        data: {
          reply,
          repliedAt:
            new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}