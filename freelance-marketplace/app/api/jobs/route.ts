import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { JobType } from "@/app/generated/prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_BUDGET = 10_000_000;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = (searchParams.get("search") || "").trim().slice(0, 100);
    const jobType = searchParams.get("jobType") || "";
    const rawMinBudget = searchParams.get("minBudget");
    const minBudget = rawMinBudget === null || rawMinBudget === "" ? 0 : Number(rawMinBudget);

    if (jobType && !Object.values(JobType).includes(jobType as JobType)) {
      return NextResponse.json({ success: false, message: "Invalid job type" }, { status: 400 });
    }
    if (!Number.isFinite(minBudget) || minBudget < 0 || minBudget > MAX_BUDGET) {
      return NextResponse.json({ success: false, message: "Invalid minimum budget" }, { status: 400 });
    }

    const jobs = await prisma.job.findMany({
      where: {
        status: "OPEN",
        title: { contains: search, mode: "insensitive" },
        ...(jobType ? { jobType: jobType as JobType } : {}),
        budget: { gte: minBudget },
      },
      include: {
        client: { select: { id: true, companyName: true, companyBio: true, website: true, country: true } },
        skills: { include: { skill: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Only clients can post jobs" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const description = typeof input.description === "string" ? input.description.trim() : "";
    const budget = Number(input.budget);
    const jobType = input.jobType;
    const duration = typeof input.duration === "string" ? input.duration.trim() : null;
    const deadline = typeof input.deadline === "string" ? new Date(input.deadline) : new Date("");
    const requiredSkills = Array.isArray(input.requiredSkills) ? input.requiredSkills : [];
    const skillIds = input.skillIds === undefined ? [] : input.skillIds;

    if (
      title.length < 3 || title.length > 150 ||
      description.length < 10 || description.length > 20_000 ||
      !Number.isFinite(budget) || budget <= 0 || budget > MAX_BUDGET ||
      !Object.values(JobType).includes(jobType as JobType) ||
      !Number.isFinite(deadline.getTime()) || deadline.getTime() <= Date.now() ||
      (duration !== null && duration.length > 100) ||
      requiredSkills.length === 0 || requiredSkills.length > 50 ||
      !requiredSkills.every((skill): skill is string => typeof skill === "string" && skill.trim().length > 0 && skill.trim().length <= 80) ||
      !Array.isArray(skillIds) ||
      skillIds.length === 0 || skillIds.length > 50 ||
      !skillIds.every((id): id is string => typeof id === "string" && id.trim().length > 0)
    ) {
      return NextResponse.json({ message: "Invalid job details" }, { status: 400 });
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!clientProfile) {
      return NextResponse.json({ message: "Client profile not found" }, { status: 404 });
    }

    const uniqueSkillIds = [...new Set((skillIds as string[]).map((id) => id.trim()))];
    const job = await prisma.$transaction(async (tx) => {
      if (uniqueSkillIds.length) {
        const existingSkills = await tx.skill.count({ where: { id: { in: uniqueSkillIds } } });
        if (existingSkills !== uniqueSkillIds.length) {
          throw new Error("INVALID_SKILL_IDS");
        }
      }

      return tx.job.create({
        data: {
          title,
          description,
          budget,
          jobType: jobType as JobType,
          duration,
          deadline,
          requiredSkills: [...new Set((requiredSkills as string[]).map((skill) => skill.trim()))],
          clientId: clientProfile.id,
          ...(uniqueSkillIds.length
            ? { skills: { create: uniqueSkillIds.map((skillId) => ({ skill: { connect: { id: skillId } } })) } }
            : {}),
        },
      });
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_SKILL_IDS") {
      return NextResponse.json({ message: "One or more selected skills do not exist" }, { status: 400 });
    }
    console.error("Create job error:", error);
    return NextResponse.json({ message: "Unable to create job" }, { status: 500 });
  }
}
