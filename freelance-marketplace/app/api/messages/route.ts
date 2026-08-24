import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

        const body = await req.json();

        const {
            jobId,
            receiverId,
            content,
        } = body;

        if (
            !jobId ||
            !receiverId ||
            !content?.trim()
        ) {
            return NextResponse.json(
                {
                    message:
                        "jobId, receiverId and content are required",
                },
                {
                    status: 400,
                }
            );
        }

        const job =
            await prisma.job.findUnique({
                where: {
                    id: jobId,
                },

                select: {
                    id: true,
                    client: {
                        select: {
                            userId: true,
                        },
                    },
                    selectedFreelancer: {
                        select: {
                            userId: true,
                        },
                    },
                },
            });

        if (!job) {
            return NextResponse.json(
                {
                    message: "Job not found",
                },
                {
                    status: 404,
                }
            );
        }

        const senderId =
            session.user.id;

        const allowedUsers = [
            job.client.userId,
            job.selectedFreelancer?.userId,
        ].filter(Boolean);

        if (!allowedUsers.includes(senderId)) {
            return NextResponse.json(
                {
                    message:
                        "You are not a participant in this job",
                },
                {
                    status: 403,
                }
            );
        }

        if (
            !allowedUsers.includes(receiverId)
        ) {
            return NextResponse.json(
                {
                    message:
                        "Receiver is not part of this job",
                },
                {
                    status: 403,
                }
            );
        }

        if (receiverId === senderId) {
            return NextResponse.json(
                {
                    message:
                        "You cannot message yourself",
                },
                {
                    status: 400,
                }
            );
        }

        const message =
            await prisma.message.create({
                data: {
                    jobId,
                    senderId,
                    receiverId,
                    content: content.trim(),
                },

                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

        return NextResponse.json(
            {
                success: true,
                message,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "Send message error:",
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