import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ freelancerId: string }> }
) {
  try {
    const { freelancerId } = await params;
    const reviews = await prisma.review.findMany({
      where: { freelancerId, isVisible: true },
      select: {
        id: true,
        rating: true,
        comment: true,
        isVerified: true,
        reply: true,
        repliedAt: true,
        createdAt: true,
        client: {
          select: {
            id: true,
            companyName: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const average = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews,
      averageRating: Number(average.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Fetch freelancer reviews error:", error);
    return NextResponse.json({ message: "Could not load reviews" }, { status: 500 });
  }
}
