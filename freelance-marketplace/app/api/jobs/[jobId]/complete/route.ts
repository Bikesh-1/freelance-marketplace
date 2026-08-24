import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ jobId: string }>;
    }
) {
    try {
        const session =
            await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        if (session.user.role !== "CLIENT") {
            return NextResponse.json(
                { message: "Only clients can complete jobs" },
                { status: 403 }
            );
        }

        const { jobId } = await params;

        const client = await prisma.clientProfile.findUnique({
            where: {
                userId: session.user.id,
            },
        });

        if (!client) {
            return NextResponse.json(
                { message: "Client profile not found" },
                { status: 404 }
            );
        }

        const job = await prisma.job.findFirst({
            where: {
                id: jobId,
                clientId: client.id,
            },
            include: {
                milestones: true,
            },
        });

        if (!job) {
            return NextResponse.json(
                { message: "Job not found" },
                { status: 404 }
            );
        }

        if (job.status !== "IN_PROGRESS") {
            return NextResponse.json(
                {
                    message:
                        "Only an in-progress job can be completed",
                },
                { status: 400 }
            );
        }

        if (job.milestones.length === 0) {
            return NextResponse.json(
                {
                    message:
                        "Job cannot be completed without milestones",
                },
                { status: 400 }
            );
        }

        const unfinishedMilestones =
            job.milestones.filter(
                (milestone) =>
                    milestone.status !== "RELEASED"
            );

        if (unfinishedMilestones.length > 0) {
            return NextResponse.json(
                {
                    message:
                        "All milestones must be released before completing the job",
                },
                { status: 400 }
            );
        }

        const completedJob =
            await prisma.job.update({
                where: {
                    id: job.id,
                },
                data: {
                    status: "COMPLETED",
                },
            });

        return NextResponse.json({
            success: true,
            message: "Job completed successfully",
            job: completedJob,
        });
    } catch (error) {
        console.error(
            "Complete job error:",
            error
        );

        return NextResponse.json(
            { message: "Server Error" },
            { status: 500 }
        );
    }
}