import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    // 1. Authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // 2. Only CLIENT can create milestone
    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        {
          message: "Only clients can create milestones",
        },
        { status: 403 }
      );
    }

    // 3. Get client profile
    const clientProfile =
      await prisma.clientProfile.findUnique({
        where: {
          userId: session.user.id,
        },
      });

    if (!clientProfile) {
      return NextResponse.json(
        {
          message: "Client profile not found",
        },
        { status: 404 }
      );
    }

    // 4. Find job and verify ownership
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        clientId: clientProfile.id,
      },
      include: {
        milestones: {
          select: {
            amount: true,
            order: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          message:
            "Job not found or you do not own this job",
        },
        { status: 404 }
      );
    }

    // 5. Job must be in valid state
    if (job.status !== "OPEN" && job.status !== "IN_PROGRESS") {
      return NextResponse.json(
        {
          message:
            "Milestones cannot be created for this job",
        },
        { status: 400 }
      );
    }

    // 6. Parse body
    const body = await req.json();

    const {
      title,
      description,
      amount,
      dueDate,
      order,
    } = body;

    // 7. Validate title
    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          message: "Milestone title is required",
        },
        { status: 400 }
      );
    }

    // 8. Validate amount
    const milestoneAmount = Number(amount);

    if (
      !Number.isFinite(milestoneAmount) ||
      milestoneAmount <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Milestone amount must be greater than 0",
        },
        { status: 400 }
      );
    }

    // 9. Validate order
    const milestoneOrder = Number(order);

    if (
      !Number.isInteger(milestoneOrder) ||
      milestoneOrder <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Milestone order must be a positive integer",
        },
        { status: 400 }
      );
    }

    // 10. Prevent duplicate order
    const existingOrder =
      job.milestones.some(
        (milestone) =>
          milestone.order === milestoneOrder
      );

    if (existingOrder) {
      return NextResponse.json(
        {
          message:
            `Milestone order ${milestoneOrder} already exists`,
        },
        { status: 400 }
      );
    }

    // 11. Validate due date
    let parsedDueDate: Date | null = null;

    if (dueDate) {
      parsedDueDate = new Date(dueDate);

      if (Number.isNaN(parsedDueDate.getTime())) {
        return NextResponse.json(
          {
            message: "Invalid due date",
          },
          { status: 400 }
        );
      }

      if (parsedDueDate < new Date()) {
        return NextResponse.json(
          {
            message:
              "Due date cannot be in the past",
          },
          { status: 400 }
        );
      }

      if (parsedDueDate > job.deadline) {
        return NextResponse.json(
          {
            message:
              "Milestone due date cannot be after the job deadline",
          },
          { status: 400 }
        );
      }
    }

    // 12. Check total milestone amount
    const existingMilestoneAmount =
      job.milestones.reduce(
        (total, milestone) =>
          total + milestone.amount,
        0
      );

    const newTotal =
      existingMilestoneAmount +
      milestoneAmount;

    if (newTotal > job.budget) {
      return NextResponse.json(
        {
          message:
            "Total milestone amount cannot exceed job budget",
        },
        { status: 400 }
      );
    }

    // 13. Create milestone
    const milestone =
      await prisma.milestone.create({
        data: {
          jobId: job.id,

          title: title.trim(),

          description:
            typeof description === "string" &&
            description.trim()
              ? description.trim()
              : null,

          amount: milestoneAmount,

          dueDate: parsedDueDate,

          order: milestoneOrder,

          status: "PENDING",
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Milestone created successfully",
        milestone,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create milestone error:",
      error
    );

    return NextResponse.json(
      {
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}