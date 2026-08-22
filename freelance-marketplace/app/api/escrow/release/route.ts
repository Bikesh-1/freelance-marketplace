import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTransaction, } from "@/lib/blockchain/verifyTransaction";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized", }, { status: 401 }
      );
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        {
          message:
            "Only clients can release payments",
        },
        { status: 403 }
      );
    }

    const clientProfile = await prisma.clientProfile.findUnique({
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
          message:
            "Client profile not found",
        },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      escrowId,
      txHash,
      amount,
      fromAddress,
      toAddress,
    } = body;
    const {
      receipt,
      transaction,
    } = await verifyTransaction(
      txHash
    );

    if (
      typeof escrowId !== "string" ||
      !escrowId.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Escrow ID is required",
        },
        { status: 400 }
      );
    }

    if (
      typeof txHash !== "string" ||
      !txHash.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Transaction hash is required",
        },
        { status: 400 }
      );
    }

    // 5. Get escrow + milestone + job
    const escrow =
      await prisma.escrow.findUnique({
        where: {
          id: escrowId,
        },
        include: {
          milestone: {
            include: {
              job: {
                select: {
                  id: true,
                  clientId: true,
                },
              },
            },
          },
        },
      });

    if (!escrow) {
      return NextResponse.json(
        {
          message: "Escrow not found",
        },
        { status: 404 }
      );
    }

    // 6. Verify client owns job
    if (
      escrow.milestone?.job.clientId !==
      clientProfile.id
    ) {
      return NextResponse.json(
        {
          message:
            "You do not have access to this escrow",
        },
        { status: 403 }
      );
    }
    if (
      Number(amount) !==
      Number(escrow.amount)
    ) {
      return NextResponse.json(
        {
          message:
            "Transaction amount does not match escrow amount",
        },
        { status: 400 }
      );
    }

    // 7. Milestone must be APPROVED
    if (
      escrow.milestone.status !==
      "APPROVED"
    ) {
      return NextResponse.json(
        {
          message:
            "Only approved milestones can be released",
        },
        { status: 400 }
      );
    }

    // 8. Escrow must be FUNDED
    if (escrow.status !== "FUNDED") {
      return NextResponse.json(
        {
          message:
            "Escrow is not funded",
        },
        { status: 400 }
      );
    }

    // 9. Prevent duplicate release
    if (escrow.status === "FUNDED") {
      return NextResponse.json(
        {
          message:
            "Payment has already been released",
        },
        { status: 400 }
      );
    }

    // 10. Amount validation
    const releaseAmount = Number(amount);

    if (
      !Number.isFinite(releaseAmount) ||
      releaseAmount <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid release amount",
        },
        { status: 400 }
      );
    }

    if (
      Math.abs(
        releaseAmount - escrow.amount
      ) > 0.000001
    ) {
      return NextResponse.json(
        {
          message:
            "Release amount does not match escrow amount",
        },
        { status: 400 }
      );
    }

    // 11. Update everything atomically
    const result =
      await prisma.$transaction(
        async (tx) => {
          const updatedEscrow =
            await tx.escrow.update({
              where: {
                id: escrow.id,
              },
              data: {
                transactionHash:
                  txHash.trim(),
                status: "RELEASED",
              },
            });

          await tx.transaction.create({
            data: {
              escrowId: escrow.id,
              txHash: txHash.trim(),
              amount: releaseAmount,
              fromAddress:
                typeof fromAddress ===
                  "string"
                  ? fromAddress
                  : "",
              toAddress:
                typeof toAddress ===
                  "string"
                  ? toAddress
                  : "",
              network:
                escrow.network,
              status: "CONFIRMED",
            },
          });

          const updatedMilestone =
            await tx.milestone.update({
              where: {
                id: escrow.milestone!.id,
              },
              data: {
                status: "RELEASED",
              },
            });

          return {
            escrow: updatedEscrow,
            milestone:
              updatedMilestone,
          };
        }
      );

    const expectedClient =
      fromAddress?.toLowerCase();

    const actualSender =
      transaction.from?.toLowerCase();

    if (
      !expectedClient ||
      actualSender !== expectedClient
    ) {
      return NextResponse.json(
        {
          message:
            "Transaction sender does not match",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Payment released successfully",
        escrow: result.escrow,
        milestone: result.milestone,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Release payment error:",
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