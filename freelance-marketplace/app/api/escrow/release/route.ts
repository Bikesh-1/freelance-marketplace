import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/blockchain/verifyTransaction";

export async function POST(
    req: NextRequest
) {
    try {
        const session =
            await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        if (session.user.role !== "CLIENT") {
            return NextResponse.json(
                {
                    message:
                        "Only clients can release payments",
                },
                {
                    status: 403,
                }
            );
        }

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
                    message:
                        "Client profile not found",
                },
                {
                    status: 404,
                }
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

        // Validate escrow ID
        if (
            typeof escrowId !== "string" ||
            !escrowId.trim()
        ) {
            return NextResponse.json(
                {
                    message:
                        "Escrow ID is required",
                },
                {
                    status: 400,
                }
            );
        }

        // Validate tx hash
        if (
            typeof txHash !== "string" ||
            !txHash.trim()
        ) {
            return NextResponse.json(
                {
                    message:
                        "Transaction hash is required",
                },
                {
                    status: 400,
                }
            );
        }

        // Get escrow
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
                {
                    status: 404,
                }
            );
        }

        // Verify client ownership
        if (
            escrow.milestone?.job.clientId !==
            clientProfile.id
        ) {
            return NextResponse.json(
                {
                    message:
                        "You do not have access to this escrow",
                },
                {
                    status: 403,
                }
            );
        }

        // Milestone must exist
        if (!escrow.milestone) {
            return NextResponse.json(
                {
                    message:
                        "Milestone not found",
                },
                {
                    status: 404,
                }
            );
        }

        // Milestone must be approved
        if (
            escrow.milestone.status !==
            "APPROVED"
        ) {
            return NextResponse.json(
                {
                    message:
                        "Only approved milestones can be released",
                },
                {
                    status: 400,
                }
            );
        }

        // Escrow must be funded
        if (escrow.status !== "FUNDED") {
            return NextResponse.json(
                {
                    message:
                        "Escrow is not funded",
                },
                {
                    status: 400,
                }
            );
        }

        // Validate amount
        const releaseAmount =
            Number(amount);

        if (
            !Number.isFinite(
                releaseAmount
            ) ||
            releaseAmount <= 0
        ) {
            return NextResponse.json(
                {
                    message:
                        "Invalid release amount",
                },
                {
                    status: 400,
                }
            );
        }

        // Amount must match escrow
        if (
            Math.abs(
                releaseAmount -
                    Number(escrow.amount)
            ) > 0.000001
        ) {
            return NextResponse.json(
                {
                    message:
                        "Release amount does not match escrow amount",
                },
                {
                    status: 400,
                }
            );
        }

        // Verify blockchain transaction
        const {
            receipt,
            transaction,
        } = await verifyTransaction(
            txHash.trim()
        );

        if (
            !receipt ||
            receipt.status !== 1
        ) {
            return NextResponse.json(
                {
                    message:
                        "Release transaction failed",
                },
                {
                    status: 400,
                }
            );
        }

        // Verify transaction sender
        const actualSender =
            transaction.from?.toLowerCase();

        const expectedSender =
            typeof fromAddress === "string"
                ? fromAddress.toLowerCase()
                : null;

        if (
            !expectedSender ||
            !actualSender ||
            actualSender !==
                expectedSender
        ) {
            return NextResponse.json(
                {
                    message:
                        "Transaction sender does not match",
                },
                {
                    status: 400,
                }
            );
        }

        // Update escrow + milestone atomically
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

                    const updatedMilestone =
                        await tx.milestone.update({
                            where: {
                                id: escrow
                                    .milestone!
                                    .id,
                            },

                            data: {
                                status: "RELEASED",
                            },
                        });

                    await tx.escrowTransaction.create({
                        data: {
                            escrowId:
                                escrow.id,

                            type: "RELEASED",

                            transactionHash:
                                txHash.trim(),

                            amount:
                                releaseAmount,

                            fromAddress:
                                fromAddress ??
                                null,

                            toAddress:
                                toAddress ??
                                null,

                            network:
                                escrow.network,
                        },
                    });

                    await tx.transaction.create({
                        data: {
                            escrowId:
                                escrow.id,

                            txHash:
                                txHash.trim(),

                            amount:
                                releaseAmount,

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

                            status:
                                "CONFIRMED",
                        },
                    });

                    return {
                        escrow:
                            updatedEscrow,

                        milestone:
                            updatedMilestone,
                    };
                }
            );

        return NextResponse.json(
            {
                success: true,

                message:
                    "Payment released successfully",

                escrow:
                    result.escrow,

                milestone:
                    result.milestone,
            },
            {
                status: 200,
            }
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
            {
                status: 500,
            }
        );
    }
}