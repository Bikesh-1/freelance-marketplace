"use client";

import { useState } from "react";
import { createDispute } from "@/services/dispute.service";

export default function RaiseDisputeForm({
  milestoneId,
  userId,
}: {
  milestoneId: string;
  userId: string;
}) {
  const [reason, setReason] =
    useState("");

  const handleSubmit = async () => {
    await createDispute({
      milestoneId,
      userId,
      reason,
    });

    alert(
      "Dispute raised successfully"
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <h3 className="text-xl font-semibold text-white">
        Raise Dispute
      </h3>

      <textarea
        value={reason}
        onChange={(e) =>
          setReason(
            e.target.value
          )
        }
        placeholder="Describe the issue..."
        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
      />

      <button
        onClick={handleSubmit}
        className="w-full rounded-lg bg-red-600 py-3 font-medium text-white hover:bg-red-500"
      >
        Submit Dispute
      </button>
    </div>
  );
}