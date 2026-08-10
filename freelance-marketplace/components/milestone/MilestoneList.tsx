"use client";

import { useMilestones } from "@/hooks/useMilestones";
import MilestoneCard from "./MilestoneCard";

export default function MilestoneList({
  jobId,
}: {
  jobId: string;
}) {
  const {
    data: milestones,
    isLoading,
  } = useMilestones(jobId);

  if (isLoading) {
    return (
      <p className="text-slate-400">
        Loading milestones...
      </p>
    );
  }

  if (!milestones?.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-400">
        No milestones found
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {milestones.map(
        (milestone: any) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
          />
        )
      )}
    </div>
  );
}