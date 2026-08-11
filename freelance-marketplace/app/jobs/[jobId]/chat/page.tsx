"use client";

import { useParams } from "next/navigation";
import ChatRoom from "@/components/chat/ChatRoom";

export default function ChatPage() {
  const params =
    useParams();

  const jobId =
    params.jobId as string;

  return (
    <main className="min-h-screen bg-slate-950 p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-white">
          Job Chat
        </h1>

        <ChatRoom jobId={jobId} />
      </div>
    </main>
  );
}