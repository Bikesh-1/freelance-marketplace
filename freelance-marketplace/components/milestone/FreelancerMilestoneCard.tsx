"use client";

import { submitMilestone } from "@/services/milestone.action";

export default function FreelancerMilestoneCard({
  milestone,
}: {
  milestone: any;
}) {
  const handleSubmit = async () => {
    await submitMilestone(
      milestone.id
    );

    alert(
      "Milestone submitted successfully"
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <h3 className="text-xl font-semibold text-white">
        {milestone.title}
      </h3>

      <p className="text-slate-400">
        {milestone.amount} ETH
      </p>

      <p className="text-slate-300">
        Status:
        {milestone.status}
      </p>

      {milestone.status ===
        "FUNDED" && (
        <button
          onClick={handleSubmit}
          className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-500"
        >
          Submit Work
        </button>
      )}
    </div>
  );
}