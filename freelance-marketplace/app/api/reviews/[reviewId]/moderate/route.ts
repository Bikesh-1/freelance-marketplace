import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ message: "Admin access required" }, { status: 403 });

    const { reviewId } = await params;
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof (body as Record<string, unknown>).isVisible !== "boolean") {
      return NextResponse.json({ message: "isVisible must be a boolean" }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isVisible: (body as Record<string, unknown>).isVisible as boolean },
    });

    const aggregate = await prisma.review.aggregate({
      where: { freelancerId: review.freelancerId, isVisible: true },
      _avg: { rating: true },
    });
    await prisma.freelancerProfile.update({
      where: { id: review.freelancerId },
      data: { averageRating: Number((aggregate._avg.rating ?? 0).toFixed(1)) },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Moderate review error:", error);
    return NextResponse.json({ message: "Could not moderate review" }, { status: 500 });
  }
}
