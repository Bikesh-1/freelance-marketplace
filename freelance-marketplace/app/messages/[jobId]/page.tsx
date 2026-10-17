"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ChatRoom from "@/components/chat/ChatRoom";
import Loginnavbar from "@/components/layout/loginNavbar";

export default function MessagesPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">
      <Loginnavbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6">
          <Link
            href="/freelancer/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 transition hover:text-red-500"
          >
            <span aria-hidden="true">←</span>
            Back to Dashboard
          </Link>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Project workspace</p>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Messages</h1>
              <p className="mt-2 text-sm text-neutral-500">Discuss project updates and coordinate with your client.</p>
            </div>
            <span className="w-fit rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-600 shadow-sm">
              Private conversation
            </span>
          </div>
        </div>

        <ChatRoom jobId={jobId} />
      </div>
    </main>
  );
}
