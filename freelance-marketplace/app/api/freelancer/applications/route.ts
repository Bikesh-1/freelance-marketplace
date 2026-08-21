import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "FREELANCER") {
      return NextResponse.json(
        { message: "Only freelancers can access applications" },
        { status: 403 }
      );
    }

    const profile = await prisma.freelancerProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { message: "Freelancer profile not found" },
        { status: 404 }
      );
    }

    const applications = await prisma.application.findMany({
      where: {
        freelancerId: profile.id,
      },
      include: {
        job: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET freelancer applications error:", error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}