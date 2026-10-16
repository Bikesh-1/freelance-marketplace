import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseInput(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const input = body as Record<string, unknown>;
  const companyName = typeof input.companyName === "string" ? input.companyName.trim() : "";
  const role = typeof input.role === "string" ? input.role.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const startDate = typeof input.startDate === "string" ? new Date(input.startDate) : new Date("");
  const endDate = typeof input.endDate === "string" && input.endDate.trim() ? new Date(input.endDate) : null;

  if (
    !companyName || companyName.length > 150 ||
    !role || role.length > 150 ||
    !description || description.length > 5000 ||
    !Number.isFinite(startDate.getTime()) ||
    (endDate && !Number.isFinite(endDate.getTime())) ||
    (endDate && endDate < startDate)
  ) return null;

  return { companyName, role, description, startDate, endDate };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "FREELANCER") return NextResponse.json({ message: "Freelancer access required" }, { status: 403 });

  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

  const experiences = await prisma.experience.findMany({
    where: { freelancerId: profile.id },
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ experiences });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "FREELANCER") return NextResponse.json({ message: "Freelancer access required" }, { status: 403 });

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 }); }
    const input = parseInput(body);
    if (!input) return NextResponse.json({ message: "Enter valid company, role, description and dates" }, { status: 400 });

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

    const experience = await prisma.experience.create({ data: { ...input, freelancerId: profile.id } });
    return NextResponse.json({ experience }, { status: 201 });
  } catch (error) {
    console.error("Create experience error:", error);
    return NextResponse.json({ message: "Could not save experience" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "FREELANCER") return NextResponse.json({ message: "Freelancer access required" }, { status: 403 });

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    const inputBody = body as Record<string, unknown>;
    const id = typeof inputBody.id === "string" ? inputBody.id.trim() : "";
    const input = parseInput(inputBody);
    if (!id || !input) return NextResponse.json({ message: "Valid experience ID and details are required" }, { status: 400 });

    const profile = await prisma.freelancerProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

    const updated = await prisma.experience.updateMany({
      where: { id, freelancerId: profile.id },
      data: input,
    });
    if (!updated.count) return NextResponse.json({ message: "Experience not found" }, { status: 404 });

    const experience = await prisma.experience.findUnique({ where: { id } });
    return NextResponse.json({ experience });
  } catch (error) {
    console.error("Update experience error:", error);
    return NextResponse.json({ message: "Could not update experience" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "FREELANCER") return NextResponse.json({ message: "Freelancer access required" }, { status: 403 });

    const id = req.nextUrl.searchParams.get("id")?.trim();
    if (!id) return NextResponse.json({ message: "Experience ID is required" }, { status: 400 });
    const profile = await prisma.freelancerProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

    const deleted = await prisma.experience.deleteMany({ where: { id, freelancerId: profile.id } });
    if (!deleted.count) return NextResponse.json({ message: "Experience not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete experience error:", error);
    return NextResponse.json({ message: "Could not delete experience" }, { status: 500 });
  }
}
