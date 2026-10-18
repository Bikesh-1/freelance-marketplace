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
    if (!session?.user?.id) return NextResponse.json({ message: "Please sign in to add a skill" }, { status: 401 });
    if (!["FREELANCER", "CLIENT", "ADMIN"].includes(session.user.role || "")) {
      return NextResponse.json({ message: "Your account cannot add skills" }, { status: 403 });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "Invalid request body" }, { status: 400 });

    const rawName = (body as Record<string, unknown>).name;
    const name = typeof rawName === "string" ? rawName.trim().replace(/\\s+/g, " ") : "";
    if (!name || name.length > 80) return NextResponse.json({ message: "Skill name must be between 1 and 80 characters" }, { status: 400 });

    const existing = await prisma.skill.findUnique({ where: { name }, select: { id: true, name: true } });
    if (existing) return NextResponse.json({ success: true, skill: existing, existing: true }, { status: 200 });

    try {
      const skill = await prisma.skill.create({ data: { name } });
      return NextResponse.json({ success: true, skill }, { status: 201 });
    } catch (error) {
      // A concurrent request may create the same unique skill after the lookup above.
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        const skill = await prisma.skill.findUnique({ where: { name }, select: { id: true, name: true } });
        if (skill) return NextResponse.json({ success: true, skill, existing: true }, { status: 200 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Create skill error:", error);
    return NextResponse.json({ message: "Could not create skill" }, { status: 500 });
  }
}
