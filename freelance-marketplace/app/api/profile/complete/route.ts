import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExperienceLevel } from "@/app/generated/prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
    const input = body as Record<string, unknown>;

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } });
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    if (user.role === "FREELANCER") {
      const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
      const title = typeof input.title === "string" ? input.title.trim() : "";
      const bio = typeof input.bio === "string" ? input.bio.trim() : "";
      const country = typeof input.country === "string" ? input.country.trim() : "";
      const location = typeof input.location === "string" ? input.location.trim() : "";
      const github = typeof input.github === "string" ? input.github.trim() : "";
      const linkedin = typeof input.linkedin === "string" ? input.linkedin.trim() : "";
      const portfolio = typeof input.portfolio === "string" ? input.portfolio.trim() : "";
      const hourlyRate = Number(input.hourlyRate);
      const yearsOfExperience = input.yearsOfExperience === undefined ? 0 : Number(input.yearsOfExperience);
      const experienceLevel = input.experienceLevel;
      const rawSkillIds = input.skillIds;
      if (!Array.isArray(rawSkillIds) || rawSkillIds.length === 0 || rawSkillIds.length > 100 || !rawSkillIds.every(id => typeof id === "string" && id.trim().length > 0)) {
        return NextResponse.json({ success: false, message: "Please select at least one valid skill" }, { status: 400 });
      }
      const skillIds = [...new Set((rawSkillIds as string[]).map(id => id.trim()))];
      const skillCount = await prisma.skill.count({ where: { id: { in: skillIds } } });
      if (skillCount !== skillIds.length) return NextResponse.json({ success: false, message: "One or more selected skills do not exist" }, { status: 400 });

      if (!fullName || fullName.length > 150 || !title || title.length > 150 || !bio || bio.length > 5000 ||
          country.length > 100 || location.length > 150 || github.length > 500 || linkedin.length > 500 || portfolio.length > 500 ||
          !Number.isFinite(hourlyRate) || hourlyRate < 0 || hourlyRate > 1_000_000 ||
          !Number.isInteger(yearsOfExperience) || yearsOfExperience < 0 || yearsOfExperience > 80 ||
          !Object.values(ExperienceLevel).includes(experienceLevel as ExperienceLevel)) {
        return NextResponse.json({ success: false, message: "Please provide valid freelancer profile details" }, { status: 400 });
      }

      const profile = await prisma.$transaction(async tx => {
        const updatedProfile = await tx.freelancerProfile.update({
        where: { userId: user.id },
        data: {
          fullName,
          title,
          bio,
          country: country || null,
          location: location || null,
          github: github || null,
          linkedin: linkedin || null,
          portfolio: portfolio || null,
          hourlyRate,
          yearsOfExperience,
          experienceLevel: experienceLevel as ExperienceLevel,
          isProfileCompleted: true,
        },
      });
        await tx.freelancerSkill.deleteMany({ where: { freelancerId: updatedProfile.id } });
        await tx.freelancerSkill.createMany({ data: skillIds.map(skillId => ({ freelancerId: updatedProfile.id, skillId })) });
        return tx.freelancerProfile.findUnique({ where: { id: updatedProfile.id }, include: { skills: { include: { skill: true } } } });
      });
      return NextResponse.json({ success: true, message: "Profile completed successfully", profile });
    }

    if (user.role === "CLIENT") {
      const companyName = typeof input.companyName === "string" ? input.companyName.trim() : "";
      const companyBio = typeof input.companyBio === "string" ? input.companyBio.trim() : "";
      const website = typeof input.website === "string" ? input.website.trim() : "";
      const country = typeof input.country === "string" ? input.country.trim() : "";
      if (!companyName || companyName.length > 150 || !companyBio || companyBio.length > 5000 || website.length > 500 || country.length > 100) {
        return NextResponse.json({ success: false, message: "Please provide valid company details" }, { status: 400 });
      }
      if (website && !/^https?:\/\//i.test(website)) return NextResponse.json({ success: false, message: "Website URL must start with http:// or https://" }, { status: 400 });

      const profile = await prisma.clientProfile.update({
        where: { userId: user.id },
        data: {
          companyName,
          companyBio,
          website: website || null,
          country: country || null,
          isProfileCompleted: true,
        },
      });
      return NextResponse.json({ success: true, message: "Profile completed successfully", profile });
    }

    return NextResponse.json({ success: false, message: "This account cannot complete a client or freelancer profile" }, { status: 403 });
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong while saving the profile" }, { status: 500 });
  }
}
