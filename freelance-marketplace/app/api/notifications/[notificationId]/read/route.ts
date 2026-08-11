import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const { notificationId } = await params;

    const notification =
      await prisma.notification.update({
        where: {
          id: notificationId,
        },

        data: {
          isRead: true,
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