import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } =
      new URL(req.url);

    const userId =
      searchParams.get(
        "userId"
      );

    const jobs =
      await prisma.job.findMany({
        where: {
          OR: [
            {
              client: {
                userId:
                  userId!,
              },
            },

            {
              applications:
                {
                  some: {
                    freelancer:
                      {
                        userId:
                          userId!,
                      },
                  },
                },
            },
          ],
        },

        include: {
          messages: {
            orderBy: {
              createdAt:
                "desc",
            },

            take: 1,
          },
        },
      });

    return NextResponse.json({
      conversations: jobs,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}