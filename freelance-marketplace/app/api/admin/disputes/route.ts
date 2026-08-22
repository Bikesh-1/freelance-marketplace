import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const disputes =
      await prisma.dispute.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          milestone: {
            include: {
              escrow: true,
              job: {
                select: {
                  id: true,
                  title: true,
                  clientId: true,
                  selectedFreelancerId: true,
                },
              },
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      disputes,
    });
  } catch (error) {
    console.error(
      "Get admin disputes error:",
      error
    );

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}