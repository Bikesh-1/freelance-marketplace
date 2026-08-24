"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Message = {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
    sender: {
        id: string;
        name: string;
    };
};

export default function JobChatPage() {
    const params = useParams();
    const router = useRouter();

    const jobId = params.jobId as string;

    const { data: session, status } = useSession();

    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState("");
    const [receiverId, setReceiverId] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (!session?.user || !jobId) return;

        const loadChat = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `/api/messages/${jobId}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load messages"
                    );
                }

                setMessages(data.messages || []);

                if (data.receiverId) {
                    setReceiverId(data.receiverId);
                }
            } catch (error) {
                console.error(error);
                setError("Failed to load chat");
            } finally {
                setLoading(false);
            }
        };

        loadChat();
    }, [session, jobId]);

    const sendMessage = async () => {
        if (!content.trim()) return;

        if (!receiverId) {
            setError("Receiver not found");
            return;
        }

        try {
            setSending(true);
            setError("");

            const response = await fetch(
                "/api/messages",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        jobId,
                        receiverId,
                        content: content.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to send message"
                );
            }

            setMessages((previous) => [
                ...previous,
                data.message,
            ]);

            setContent("");
        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to send message"
            );
        } finally {
            setSending(false);
        }
    };

    if (
        status === "loading" ||
        loading
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950">
                <p className="text-slate-400">
                    Loading chat...
                </p>
            </main>
        );
    }

    if (!session?.user) {
        return null;
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8">
            <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                    <div>
                        <h1 className="text-lg font-semibold text-white">
                            Project Chat
                        </h1>

                        <p className="text-xs text-slate-500">
                            Job ID: {jobId}
                        </p>
                    </div>

                    <Link
                        href={
                            session.user.role === "CLIENT"
                                ? `/client/jobs/${jobId}`
                                : `/freelancer/jobs/${jobId}`
                        }
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800"
                    >
                        Back
                    </Link>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-sm text-slate-500">
                                No messages yet. Start the conversation.
                            </p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isMine =
                                message.senderId ===
                                session.user.id;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${
                                        isMine
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                            isMine
                                                ? "bg-indigo-600 text-white"
                                                : "bg-slate-800 text-slate-200"
                                        }`}
                                    >
                                        {!isMine && (
                                            <p className="mb-1 text-xs font-semibold text-indigo-300">
                                                {message.sender.name}
                                            </p>
                                        )}

                                        <p className="whitespace-pre-wrap text-sm">
                                            {message.content}
                                        </p>

                                        <p
                                            className={`mt-2 text-[10px] ${
                                                isMine
                                                    ? "text-indigo-200"
                                                    : "text-slate-500"
                                            }`}
                                        >
                                            {new Date(
                                                message.createdAt
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="border-t border-slate-800 bg-red-950/20 px-5 py-3">
                        <p className="text-sm text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                {/* Input */}
                <div className="border-t border-slate-800 p-4">
                    <div className="flex gap-3">
                        <textarea
                            value={content}
                            onChange={(e) =>
                                setContent(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (
                                    e.key === "Enter" &&
                                    !e.shiftKey
                                ) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Write a message..."
                            rows={2}
                            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                        />

                        <button
                            onClick={sendMessage}
                            disabled={
                                sending ||
                                !content.trim()
                            }
                            className="self-end rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {sending
                                ? "Sending..."
                                : "Send"}
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-600">
                        Press Enter to send • Shift + Enter for new line
                    </p>
                </div>
            </div>
        </main>
    );
}