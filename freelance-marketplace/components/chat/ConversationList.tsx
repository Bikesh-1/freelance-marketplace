"use client";

import Link from "next/link";

type Conversation = {
id: string;
title: string;
messages: {
id: string;
content: string;
createdAt?: string | Date;
}[];
};

export default function ConversationList({conversations,}: {conversations: Conversation[]}) {
  if (conversations.length === 0) {
    return(
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
        <p className="text-slate-400">No conversations yet</p>
        <p className="mt-2 text-sm text-slate-500"> Once a freelancer is accepted for a job, the conversation will appear here. </p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {conversations.map((job) => (
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