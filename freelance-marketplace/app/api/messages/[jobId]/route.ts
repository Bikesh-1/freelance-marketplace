import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    {
        params,
    }: {
        params: Promise<{
            jobId: string;
        }>;
    }
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

        const { jobId } =
            await params;

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

        const allowedUsers = [
            job.client.userId,
            job.selectedFreelancer?.userId,
        ].filter(Boolean);

        if (
            !allowedUsers.includes(
                session.user.id
            )
        ) {
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

        const messages =
            await prisma.message.findMany({
                where: {
                    jobId,
                },

                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },

                orderBy: {
                    createdAt: "asc",
                },
            });

        const receiverId =
            allowedUsers.find(
                (id) =>
                    id !== session.user.id
            ) || null;

        return NextResponse.json({
            messages,
            receiverId,
        });
    } catch (error) {
        console.error(
            "Get messages error:",
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