import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";

export default async function MessagesPage() {
    const session =
        await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const userId =
        session.user.id;

    const messages =
        await prisma.message.findMany({
            where: {
                OR: [
                    {
                        senderId: userId,
                    },
                    {
                        receiverId: userId,
                    },
                ],
            },

            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                    },
                },

                sender: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                receiver: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });

    const conversations =
        new Map<
            string,
            (typeof messages)[number]
        >();

    for (const message of messages) {
        if (!conversations.has(message.jobId)) {
            conversations.set(
                message.jobId,
                message
            );
        }
    }

    const chats = Array.from(
        conversations.values()
    );

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-slate-950 px-6 py-10">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white">
                            Messages
                        </h1>

                        <p className="mt-2 text-slate-400">
                            Your job conversations.
                        </p>
                    </div>

                    {chats.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                            <p className="text-slate-400">
                                No conversations yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {chats.map((chat) => {
                                const otherUser =
                                    chat.senderId ===
                                    userId
                                        ? chat.receiver
                                        : chat.sender;

                                return (
                                    <Link
                                        key={chat.jobId}
                                        href={`/messages/${chat.jobId}`}
                                        className="block rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 hover:bg-slate-800"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h2 className="font-semibold text-white">
                                                    {chat.job.title}
                                                </h2>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    {otherUser.name}
                                                </p>

                                                <p className="mt-2 line-clamp-1 text-sm text-slate-500">
                                                    {chat.content}
                                                </p>
                                            </div>

                                            <span className="text-xs text-slate-600">
                                                {new Date(
                                                    chat.createdAt
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}