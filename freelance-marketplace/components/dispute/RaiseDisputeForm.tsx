"use client";

import { useState } from "react";

import { createDispute } from "@/services/dispute.service";

export default function RaiseDisputeForm({
  milestoneId,
}: {
  milestoneId: string;
}) {
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!reason.trim()) {
        alert("Dispute reason is required");
        return;
      }

      setLoading(true);

      await createDispute({
        milestoneId,
        reason: reason.trim(),
        evidence: evidence.trim() || undefined,
      });

      alert("Dispute raised successfully");

      window.location.reload();
    } catch (error) {
      console.error(
        "Raise dispute error:",
        error
      );

      alert("Failed to raise dispute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-red-100 bg-red-50/60 px-5 py-5">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-sm font-bold text-red-600">
            !
          </div>

          <div>
            <h3 className="text-sm font-bold text-neutral-950">
              Raise Dispute
            </h3>

            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Report an issue with this milestone for review.
            </p>
          </div>

        </div>

      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <div className="space-y-5 p-5">

        {/* Reason */}

        <div>

          <label
            htmlFor="dispute-reason"
            className="mb-2 block text-xs font-semibold text-neutral-800"
          >
            Reason for Dispute
            <span className="ml-1 text-red-500">*</span>
          </label>

          <textarea
            id="dispute-reason"
            value={reason}
            onChange={(e) =>
              setReason(e.target.value)
            }
            placeholder="Describe the issue clearly..."
            rows={5}
            disabled={loading}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="mt-2 text-[10px] text-neutral-400">
            Explain what went wrong and why you are raising
            this dispute.
          </p>

        </div>

        {/* Evidence */}

        <div>

          <label
            htmlFor="dispute-evidence"
            className="mb-2 block text-xs font-semibold text-neutral-800"
          >
            Evidence URL
            <span className="ml-1 font-normal text-neutral-400">
              (Optional)
            </span>
          </label>

          <input
            id="dispute-evidence"
            type="url"
            value={evidence}
            onChange={(e) =>
              setEvidence(e.target.value)
            }
            placeholder="https://example.com/evidence"
            disabled={loading}
            className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="mt-2 text-[10px] text-neutral-400">
            Add a link to screenshots, documents or other
            supporting evidence.
          </p>

        </div>

        {/* Warning */}

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">

          <div className="flex items-start gap-3">

            <div className="mt-0.5 text-sm text-neutral-500">
              ●
            </div>

            <p className="text-xs leading-5 text-neutral-500">
              Please provide accurate information and relevant
              evidence. Disputes may require review before a
              final decision is made.
            </p>

          </div>

        </div>

        {/* Submit */}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Submitting...
            </>
          ) : (
            <>
              Submit Dispute
              <span>→</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}