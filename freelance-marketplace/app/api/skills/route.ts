import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ success: true, skills });
  } catch (error) {
    console.error("Fetch skills error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ message: "Admin access required" }, { status: 403 });

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    const name = typeof (body as Record<string, unknown>).name === "string" ? ((body as Record<string, unknown>).name as string).trim() : "";
    if (!name || name.length > 80) return NextResponse.json({ message: "Skill name must be between 1 and 80 characters" }, { status: 400 });

    const existing = await prisma.skill.findUnique({ where: { name }, select: { id: true } });
    if (existing) return NextResponse.json({ message: "This skill already exists" }, { status: 409 });
    const skill = await prisma.skill.create({ data: { name } });
    return NextResponse.json({ success: true, skill }, { status: 201 });
  } catch (error) {
    console.error("Create skill error:", error);
    return NextResponse.json({ message: "Could not create skill" }, { status: 500 });
  }
}
