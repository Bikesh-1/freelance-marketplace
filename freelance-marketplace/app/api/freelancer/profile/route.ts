import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "FREELANCER") return NextResponse.json({ message: "Freelancer access required" }, { status: 403 });

  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId: session.user.id },
    include: { skills: { include: { skill: true } } },
  });
  if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "FREELANCER") return NextResponse.json({ message: "Freelancer access required" }, { status: 403 });

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "Invalid request body" }, { status: 400 });

    const input = body as Record<string, unknown>;
    const stringFields = ["fullName", "title", "bio", "country", "location", "github", "linkedin", "portfolio"] as const;
    const clean: Record<string, string | null> = {};
    for (const field of stringFields) {
      const value = input[field];
      if (value !== undefined) {
        if (value !== null && typeof value !== "string") return NextResponse.json({ message: `${field} must be a string` }, { status: 400 });
        const trimmed = typeof value === "string" ? value.trim() : "";
        if (trimmed.length > (field === "bio" ? 5000 : field === "title" ? 150 : 500)) {
          return NextResponse.json({ message: `${field} is too long` }, { status: 400 });
        }
        clean[field] = trimmed || null;
      }
    }

    const hourlyRate = input.hourlyRate === undefined ? undefined : Number(input.hourlyRate);
    const yearsOfExperience = input.yearsOfExperience === undefined ? undefined : Number(input.yearsOfExperience);
    if (hourlyRate !== undefined && (!Number.isFinite(hourlyRate) || hourlyRate < 0 || hourlyRate > 1_000_000)) {
      return NextResponse.json({ message: "Hourly rate must be a valid non-negative number" }, { status: 400 });
    }
    if (yearsOfExperience !== undefined && (!Number.isInteger(yearsOfExperience) || yearsOfExperience < 0 || yearsOfExperience > 80)) {
      return NextResponse.json({ message: "Years of experience must be an integer from 0 to 80" }, { status: 400 });
    }
    const rawSkillIds = input.skillIds;
    if (rawSkillIds !== undefined && (!Array.isArray(rawSkillIds) || rawSkillIds.length > 100 || !rawSkillIds.every(id => typeof id === "string" && id.trim().length > 0))) {
      return NextResponse.json({ message: "skillIds must be an array of valid skill IDs" }, { status: 400 });
    }

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

    const skillIds = rawSkillIds === undefined ? undefined : [...new Set((rawSkillIds as string[]).map(id => id.trim()))];
    if (skillIds?.length) {
      const count = await prisma.skill.count({ where: { id: { in: skillIds } } });
      if (count !== skillIds.length) return NextResponse.json({ message: "One or more selected skills do not exist" }, { status: 400 });
    }

    const data = {
      ...(clean.fullName !== undefined ? { fullName: clean.fullName } : {}),
      ...(clean.title !== undefined ? { title: clean.title ?? "" } : {}),
      ...(clean.bio !== undefined ? { bio: clean.bio ?? "" } : {}),
      ...(clean.country !== undefined ? { country: clean.country } : {}),
      ...(clean.location !== undefined ? { location: clean.location } : {}),
      ...(clean.github !== undefined ? { github: clean.github } : {}),
      ...(clean.linkedin !== undefined ? { linkedin: clean.linkedin } : {}),
      ...(clean.portfolio !== undefined ? { portfolio: clean.portfolio } : {}),
      ...(hourlyRate !== undefined ? { hourlyRate } : {}),
      ...(yearsOfExperience !== undefined ? { yearsOfExperience } : {}),
    };

    await prisma.$transaction(async tx => {
      if (Object.keys(data).length) {
        await tx.freelancerProfile.update({ where: { id: profile.id }, data });
      }
      if (skillIds !== undefined) {
        await tx.freelancerSkill.deleteMany({ where: { freelancerId: profile.id } });
        if (skillIds.length) {
          await tx.freelancerSkill.createMany({ data: skillIds.map(skillId => ({ freelancerId: profile.id, skillId })) });
        }
      }
    });

    const updated = await prisma.freelancerProfile.findUnique({
      where: { id: profile.id },
      include: { skills: { include: { skill: true } } },
    });
    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("Update freelancer profile error:", error);
    return NextResponse.json({ message: "Could not update freelancer profile" }, { status: 500 });
  }
}
