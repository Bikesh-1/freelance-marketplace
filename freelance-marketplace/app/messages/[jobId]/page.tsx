"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ChatRoom from "@/components/chat/ChatRoom";

export default function MessagesPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Freelance Marketplace</p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Messages</h1>
          </div>
          <Link href="/jobs" className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
            Back to jobs
          </Link>
        </div>
        <ChatRoom jobId={jobId} />
      </div>
    </main>
  );
}
