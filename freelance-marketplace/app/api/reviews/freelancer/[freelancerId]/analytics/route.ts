import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ freelancerId: string }> }
) {
  try {
    const { freelancerId } =
      await params;

    const reviews =
      await prisma.review.findMany({
        where: {
          freelancerId,
          isVisible: true,
        },
      });

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    let verified = 0;

    for (const review of reviews) {
      distribution[
        review.rating as keyof typeof distribution
      ]++;

      if (
        review.isVerified
      )
        verified++;
    }

    return NextResponse.json({
      totalReviews:
        reviews.length,
      verifiedReviews:
        verified,
      distribution,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}