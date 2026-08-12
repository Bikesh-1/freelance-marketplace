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
        },

        include: {
          client: {
            include: {
              user: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    const average =
      reviews.length
        ? reviews.reduce(
            (
              sum,
              r
            ) =>
              sum +
              r.rating,
            0
          ) /
          reviews.length
        : 0;

    return NextResponse.json({
      reviews,
      averageRating:
        Number(
          average.toFixed(
            1
          )
        ),
      totalReviews:
        reviews.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}