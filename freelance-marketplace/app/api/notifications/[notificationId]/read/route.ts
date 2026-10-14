import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { notificationId } = await params;
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId: session.user.id },
      data: { isRead: true },
    });
    if (result.count === 0) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId: session.user.id },
    });
    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
