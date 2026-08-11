import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");

    const cursor = searchParams.get("cursor");

    const notifications =
      await prisma.notification.findMany({
        where: {
          userId: userId!,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 10,

        ...(cursor
          ? {
              skip: 1,

              cursor: {
                id: cursor,
              },
            }
          : {}),
      });

    const nextCursor =
      notifications.length === 10
        ? notifications[9].id
        : null;

    return NextResponse.json({
      notifications,
      nextCursor,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const notification =
      await prisma.notification.create({
        data: {
          userId: body.userId,
          type: body.type,
          title: body.title,
          message: body.message,
        },
      });

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}