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
    if (session.user.role !== "FREELANCER") return NextResponse.json({ message: "Only the reviewed freelancer can reply" }, { status: 403 });

    const { reviewId } = await params;
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    const reply = typeof (body as Record<string, unknown>).reply === "string" ? ((body as Record<string, unknown>).reply as string).trim() : "";
    if (!reply || reply.length > 2000) return NextResponse.json({ message: "Reply must be between 1 and 2000 characters" }, { status: 400 });

    const profile = await prisma.freelancerProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    if (!profile) return NextResponse.json({ message: "Freelancer profile not found" }, { status: 404 });

    const review = await prisma.review.findUnique({ where: { id: reviewId }, select: { id: true, freelancerId: true } });
    if (!review) return NextResponse.json({ message: "Review not found" }, { status: 404 });
    if (review.freelancerId !== profile.id) return NextResponse.json({ message: "You cannot reply to another freelancer's review" }, { status: 403 });

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { reply, repliedAt: new Date() },
    });
    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error("Reply to review error:", error);
    return NextResponse.json({ message: "Could not reply to review" }, { status: 500 });
  }
}
