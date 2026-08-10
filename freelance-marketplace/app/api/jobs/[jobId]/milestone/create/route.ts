import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const body = await req.json();

    const {
      title,
      description,
      amount,
      dueDate,
      order,
    } = body;

    const milestone =
      await prisma.milestone.create({
        data: {
          jobId,
          title,
          description,
          amount,
          dueDate: dueDate
            ? new Date(dueDate)
            : null,
          order,
        },
      });

    return NextResponse.json({
      success: true,
      milestone,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}