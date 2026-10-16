import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Only clients can submit reviews" }, { status: 403 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const freelancerId = typeof input.freelancerId === "string" ? input.freelancerId.trim() : "";
    const rating = Number(input.rating);
    const comment = typeof input.comment === "string" ? input.comment.trim() : "";

    if (!freelancerId || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 3 || comment.length > 2000) {
      return NextResponse.json({ message: "Provide a freelancer, a rating from 1 to 5, and a comment between 3 and 2000 characters" }, { status: 400 });
    }

    const client = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!client) return NextResponse.json({ message: "Client profile not found" }, { status: 404 });

    const freelancer = await prisma.freelancerProfile.findUnique({
      where: { id: freelancerId },
      select: { id: true },
    });
    if (!freelancer) return NextResponse.json({ message: "Freelancer not found" }, { status: 404 });

    const releasedEscrow = await prisma.escrow.findFirst({
      where: {
        status: "RELEASED",
        job: { clientId: client.id, selectedFreelancerId: freelancer.id },
      },
      select: { id: true },
    });
    if (!releasedEscrow) {
      return NextResponse.json({ message: "A released project escrow is required before reviewing this freelancer" }, { status: 403 });
    }

    const existing = await prisma.review.findFirst({
      where: { clientId: client.id, freelancerId: freelancer.id },
      select: { id: true },
    });
    if (existing) return NextResponse.json({ message: "You have already reviewed this freelancer" }, { status: 409 });

    const review = await prisma.review.create({
      data: {
        clientId: client.id,
        freelancerId: freelancer.id,
        rating,
        comment,
        isVerified: true,
      },
      include: { client: { select: { id: true, companyName: true } } },
    });

    const aggregate = await prisma.review.aggregate({
      where: { freelancerId: freelancer.id, isVisible: true },
      _avg: { rating: true },
    });
    await prisma.freelancerProfile.update({
      where: { id: freelancer.id },
      data: { averageRating: Number((aggregate._avg.rating ?? 0).toFixed(1)) },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ message: "Could not submit review" }, { status: 500 });
  }
}
