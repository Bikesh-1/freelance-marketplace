"use client";

import Link from "next/link";

export default function ConversationList({
  conversations,
}: {
  conversations: any[];
}) {
  return (
    <div className="space-y-3">
      {conversations.map(
        (job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}/chat`}
          >
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:bg-slate-800 transition">
              <h3 className="font-semibold text-white">
                {job.title}
              </h3>

              <p className="text-sm text-slate-400 truncate mt-1">
                {job.messages[0]
                  ?.content ||
                  "No messages yet"}
              </p>
            </div>
          </Link>
        )
      )}
    </div>
  );
}