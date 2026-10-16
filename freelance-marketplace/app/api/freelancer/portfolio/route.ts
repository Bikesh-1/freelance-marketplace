import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parsePortfolioInput(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const input = body as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const optionalUrl = (key: string) => {
    const value = input[key];
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string" || value.trim().length > 1000) return undefined;
    const trimmed = value.trim();
    try {
      const parsed = new URL(trimmed);
      return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : undefined;
    } catch { return undefined; }
  };
  const githubUrl = optionalUrl("githubUrl");
  const liveUrl = optionalUrl("liveUrl");
  const imageUrl = optionalUrl("imageUrl");
  const projectUrl = optionalUrl("projectUrl");
  if (!title || title.length > 150 || !description || description.length > 5000 ||
      githubUrl === undefined || liveUrl === undefined || imageUrl === undefined || projectUrl === undefined) return null;
  return { title, description, githubUrl, liveUrl, imageUrl, projectUrl };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "FREELANCER") return NextResponse.json({ message: "Freelancer access required" }, { status: 403 });
    const profile = await prisma.freelancerProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    const projects = await prisma.portfolio.findMany({
      where: { freelancerId: profile.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Fetch portfolio error:", error);
    return NextResponse.json({ message: "Could not load portfolio" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "FREELANCER") return NextResponse.json({ message: "Freelancer access required" }, { status: 403 });

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 }); }
    const input = parsePortfolioInput(body);
    if (!input) return NextResponse.json({ message: "Enter a valid title, description and optional http/https URLs" }, { status: 400 });

    const profile = await prisma.freelancerProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

    const project = await prisma.portfolio.create({
      data: {
        title: input.title,
        description: input.description,
        projectUrl: input.projectUrl,
        githubUrl: input.githubUrl,
        liveUrl: input.liveUrl,
        imageUrl: input.imageUrl,
        freelancerId: profile.id,
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create portfolio project error:", error);
    return NextResponse.json({ message: "Could not create portfolio project" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "FREELANCER") return NextResponse.json({ message: "Freelancer access required" }, { status: 403 });
    const id = req.nextUrl.searchParams.get("id")?.trim();
    if (!id) return NextResponse.json({ message: "Portfolio project ID is required" }, { status: 400 });
    const profile = await prisma.freelancerProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

    const result = await prisma.portfolio.deleteMany({ where: { id, freelancerId: profile.id } });
    if (!result.count) return NextResponse.json({ message: "Portfolio project not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete portfolio project error:", error);
    return NextResponse.json({ message: "Could not delete portfolio project" }, { status: 500 });
  }
}
