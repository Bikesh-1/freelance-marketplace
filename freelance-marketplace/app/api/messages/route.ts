import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            jobId,
            senderId,
            content,
            receiverId,
        } = body;

        const message =
            await prisma.message.create({
                data: {
                    jobId,
                    senderId,
                    receiverId,
                    content,
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

        return NextResponse.json({
            success: true,
            message,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Server Error" },
            { status: 500 }
        );
    }
}