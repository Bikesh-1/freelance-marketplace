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

  {/* =====================================================
      LOADING
  ===================================================== */}

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">

          <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-red-500" />

          <div>
            <p className="text-sm font-medium text-neutral-700">
              Loading milestones...
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              Fetching the latest project milestones.
            </p>
          </div>

        </div>
      </div>
    );
  }

  {/* =====================================================
      EMPTY STATE
  ===================================================== */}

  if (!milestones?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-14 text-center shadow-sm">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-400">
          —
        </div>

        <h3 className="mt-5 text-lg font-semibold text-neutral-950">
          No milestones found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
          There are no milestones available for this project yet.
        </p>

      </div>
    );
  }

  {/* =====================================================
      MILESTONE LIST
  ===================================================== */}

  return (
    <div className="space-y-4">

      {/* List Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span className="h-2 w-2 rounded-full bg-red-500" />

          <h2 className="text-sm font-semibold text-neutral-950">
            Project Milestones
          </h2>

        </div>

        <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          {milestones.length}{" "}
          {milestones.length === 1
            ? "Milestone"
            : "Milestones"}
        </span>

      </div>

      {/* Milestones */}

      <div className="space-y-4">

        {milestones.map((milestone: any) => (
          <div
            key={milestone.id}
            className="rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
          >
            <MilestoneCard
              milestone={milestone}
            />
          </div>
        ))}

      </div>

    </div>
  );
}