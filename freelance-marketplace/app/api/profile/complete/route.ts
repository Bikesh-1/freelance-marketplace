import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const body = await req.json();

    const {
      fullName,
      bio,
      country,
      hourlyRate,
      experienceLevel,
      companyName,
    } = body;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.role === "FREELANCER") {
      await prisma.freelancerProfile.update({
        where: {
          userId: user.id,
        },
        data: {
          fullName,
          bio,
          country,
          hourlyRate,
          experienceLevel,
          isProfileCompleted: true,
        },
      });
    }

    if (user.role === "CLIENT") {
      await prisma.clientProfile.update({
        where: {
          userId: user.id,
        },
        data: {
          companyName,
          country,
          isProfileCompleted: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile completed successfully",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}