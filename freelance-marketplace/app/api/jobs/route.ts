import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { JobType } from "@/app/generated/prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams

    const search = searchParams.get("search") || ""
    const jobType = searchParams.get("jobType") || ""
    const minBudget = Number(
      searchParams.get("minBudget") || 0
    )

    const jobs = await prisma.job.findMany({
      where: {
        AND: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },

          jobType
            ? {
                jobType: jobType as JobType,
              }
            : {},

          {
            budget: {
              gte: minBudget,
            },
          },

          {
            status: "OPEN",
          },
        ],
      },

      include: {
        client: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      jobs,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch jobs",
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { message: "Only clients can post jobs" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      title,
      description,
      budget,
      jobType,
      duration,
      deadline,
      requiredSkills,
      skillIds,
    } = body;

    const clientProfile = await prisma.clientProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!clientProfile) {
      return NextResponse.json(
        { message: "Client profile not found" },
        { status: 404 }
      );
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        budget: Number(budget),
        jobType,
        duration,
        deadline: new Date(deadline),
        requiredSkills: requiredSkills || [],
        clientId: clientProfile.id,
      },
    });

    if (skillIds?.length) {
      await prisma.jobSkill.createMany({
        data: skillIds.map((skillId: string) => ({
          jobId: job.id,
          skillId,
        })),
      });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}