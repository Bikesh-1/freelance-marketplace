"use client";

import { useState } from "react";

import { createDispute } from "@/services/dispute.service";

export default function RaiseDisputeForm({
  milestoneId,
}: {
  milestoneId: string;
}) {
  const [reason, setReason] =
    useState("");

  const [evidence, setEvidence] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async () => {
    try {
      if (!reason.trim()) {
        alert(
          "Dispute reason is required"
        );
        return;
      }

      setLoading(true);

      await createDispute({
        milestoneId,

        reason:
          reason.trim(),

        evidence:
          evidence.trim() ||
          undefined,
      });

      alert(
        "Dispute raised successfully"
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "Raise dispute error:",
        error
      );

      alert(
        "Failed to raise dispute"
      );
    } finally {
      setLoading(false);
    }
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

      <input
        type="url"
        value={evidence}
        onChange={(e) =>
          setEvidence(
            e.target.value
          )
        }
        placeholder="Evidence URL (optional)"
        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-lg bg-red-600 py-3 font-medium text-white hover:bg-red-500 disabled:opacity-50"
      >
        {loading
          ? "Submitting..."
          : "Submit Dispute"}
      </button>
    </div>
  );
}