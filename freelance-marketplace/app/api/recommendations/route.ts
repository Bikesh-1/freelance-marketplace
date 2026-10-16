import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "FREELANCER") return NextResponse.json({ message: "Freelancer access required" }, { status: 403 });

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      include: { skills: { include: { skill: true } } },
    });
    if (!profile) return NextResponse.json({ message: "Freelancer profile not found" }, { status: 404 });

    const recommendations = await prisma.aIRecommendation.findMany({
      where: { userId: session.user.id, jobId: { not: null } },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      take: 50,
    });

    const jobIds = recommendations.map(item => item.jobId).filter((id): id is string => !!id);
    const jobs = jobIds.length ? await prisma.job.findMany({
      where: { id: { in: jobIds }, status: "OPEN" },
      include: {
        client: { select: { id: true, companyName: true, country: true } },
        skills: { include: { skill: true } },
      },
    }) : [];
    const byId = new Map(jobs.map(job => [job.id, job]));

    return NextResponse.json({
      recommendations: recommendations.flatMap(item => {
        const job = item.jobId ? byId.get(item.jobId) : undefined;
        return job ? [{ id: item.id, score: item.score, reason: item.reason, createdAt: item.createdAt, job }] : [];
      }),
      generatedAt: new Date().toISOString(),
      method: "Saved skill-match recommendations",
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    return NextResponse.json({ message: "Could not load recommendations" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "FREELANCER") return NextResponse.json({ message: "Freelancer access required" }, { status: 403 });

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
      include: { skills: { include: { skill: true } } },
    });
    if (!profile) return NextResponse.json({ message: "Freelancer profile not found" }, { status: 404 });

    const skills = profile.skills.map(item => item.skill.name.trim().toLowerCase());
    const jobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      include: {
        client: { select: { id: true, companyName: true, country: true } },
        skills: { include: { skill: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const scored = jobs.map(job => {
      const jobSkills = [...new Set([
        ...job.requiredSkills,
        ...job.skills.map(item => item.skill.name),
      ].map(name => name.trim().toLowerCase()).filter(Boolean))];
      const matches = jobSkills.filter(name => skills.includes(name));
      const score = jobSkills.length ? Math.round((matches.length / jobSkills.length) * 100) : 0;
      const reason = matches.length
        ? `Matches your skills: ${matches.join(", ")}.`
        : jobSkills.length
          ? "No direct skill match found; review the full job description before applying."
          : "This job has no structured skills listed; review the requirements manually.";

      return { job, score, reason };
    }).sort((a, b) => b.score - a.score || b.job.createdAt.getTime() - a.job.createdAt.getTime()).slice(0, 30);

    await prisma.$transaction(async tx => {
      await tx.aIRecommendation.deleteMany({ where: { userId: session.user.id, jobId: { not: null } } });
      if (scored.length) {
        await tx.aIRecommendation.createMany({
          data: scored.map(item => ({
            userId: session.user.id,
            jobId: item.job.id,
            score: item.score,
            reason: item.reason,
          })),
        });
      }
    });

    return NextResponse.json({
      success: true,
      count: scored.length,
      recommendations: scored.map(item => ({
        score: item.score,
        reason: item.reason,
        job: item.job,
      })),
      method: "Transparent skill-match scoring; this is not an ML/LLM prediction.",
    });
  } catch (error) {
    console.error("Generate recommendations error:", error);
    return NextResponse.json({ message: "Could not generate recommendations" }, { status: 500 });
  }
}
