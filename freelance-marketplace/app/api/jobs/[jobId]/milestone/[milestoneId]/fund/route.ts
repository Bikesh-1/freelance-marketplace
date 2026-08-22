import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ milestoneId: string }>;
  }
) {
  try {
    const { milestoneId } = await params;

    // 1. Authentication
    const session = await getServerSession(
      authOptions
    );

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // 2. Only client can fund milestone
    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        {
          message:
            "Only clients can fund milestones",
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
        select: {
          id: true,
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

    // 4. Find milestone + job
    const milestone =
      await prisma.milestone.findUnique({
        where: {
          id: milestoneId,
        },
        include: {
          job: {
            select: {
              id: true,
              clientId: true,
              selectedFreelancerId: true,
            },
          },
          escrow: true,
        },
      });

    if (!milestone) {
      return NextResponse.json(
        {
          message: "Milestone not found",
        },
        { status: 404 }
      );
    }

    // 5. Verify job ownership
    if (
      milestone.job.clientId !==
      clientProfile.id
    ) {
      return NextResponse.json(
        {
          message:
            "You do not have access to this milestone",
        },
        { status: 403 }
      );
    }

    // 6. Freelancer must be selected
    if (
      !milestone.job.selectedFreelancerId
    ) {
      return NextResponse.json(
        {
          message:
            "A freelancer must be selected before funding",
        },
        { status: 400 }
      );
    }

    // 7. Only PENDING milestones can be funded
    if (milestone.status !== "PENDING") {
      return NextResponse.json(
        {
          message:
            "Only pending milestones can be funded",
        },
        { status: 400 }
      );
    }

    // 8. Prevent duplicate escrow
    if (milestone.escrow) {
      return NextResponse.json(
        {
          message:
            "This milestone already has an escrow",
        },
        { status: 400 }
      );
    }

    // 9. Read blockchain transaction data
    const body = await req.json();

    const {
      contractAddress,
      transactionHash,
      amount,
      network,
    } = body;

    // 10. Validate contract address
    if (
      typeof contractAddress !== "string" ||
      !contractAddress.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Contract address is required",
        },
        { status: 400 }
      );
    }

    // 11. Validate transaction hash
    if (
      typeof transactionHash !== "string" ||
      !transactionHash.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Transaction hash is required",
        },
        { status: 400 }
      );
    }

    // 12. Amount must match milestone
    const fundedAmount = Number(amount);

    if (
      !Number.isFinite(fundedAmount) ||
      fundedAmount <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid funding amount",
        },
        { status: 400 }
      );
    }

    if (
      Math.abs(
        fundedAmount - milestone.amount
      ) > 0.000001
    ) {
      return NextResponse.json(
        {
          message:
            "Funding amount does not match milestone amount",
        },
        { status: 400 }
      );
    }

    // 13. Create escrow + update milestone
    const result =
      await prisma.$transaction(async (tx) => {
        const escrow =
          await tx.escrow.create({
            data: {
              jobId: milestone.job.id,
              contractAddress:
                contractAddress.trim(),
              transactionHash:
                transactionHash.trim(),
              network:
                typeof network === "string" &&
                network.trim()
                  ? network.trim()
                  : "sepolia",
              amount: milestone.amount,
              status: "FUNDED",
            },
          });

        const updatedMilestone =
          await tx.milestone.update({
            where: {
              id: milestone.id,
            },
            data: {
              status: "FUNDED",
              escrowId: escrow.id,
            },
            include: {
              escrow: true,
            },
          });

        return {
          escrow,
          milestone: updatedMilestone,
        };
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Milestone funded successfully",
        milestone: result.milestone,
        escrow: result.escrow,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Fund milestone error:",
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