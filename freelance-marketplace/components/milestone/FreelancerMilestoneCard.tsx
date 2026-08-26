"use client";

import { useState } from "react";

import { submitMilestone } from "@/services/milestone.action";
import RaiseDisputeForm from "@/components/dispute/RaiseDisputeForm";

type Milestone = {
  id: string;
  title: string;
  description?: string | null;
  amount: number;

  status:
    | "PENDING"
    | "FUNDED"
    | "DISPUTED"
    | "SUBMITTED"
    | "APPROVED"
    | "RELEASED"
    | "REFUNDED";

  submissionUrl?: string | null;
  submissionNote?: string | null;

  escrow?: {
    id: string;
    blockchainEscrowId: number | null;
  } | null;
};

export default function FreelancerMilestoneCard({
  milestone,
}: {
  milestone: Milestone;
}) {
  const [submissionNote, setSubmissionNote] = useState(
    milestone.submissionNote || ""
  );

  const [submissionUrl, setSubmissionUrl] = useState(
    milestone.submissionUrl || ""
  );

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!submissionUrl.trim()) {
        alert("Submission URL is required");
        return;
      }

      setSubmitting(true);

      await submitMilestone(milestone.id, {
        submissionUrl: submissionUrl.trim(),
        submissionNote: submissionNote.trim() || undefined,
      });

      alert("Milestone submitted successfully");
      window.location.reload();
    } catch (error) {
      console.error("Submit milestone error:", error);

      alert("Failed to submit milestone");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

        <div className="min-w-0">

          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              Milestone
            </span>
          </div>

          <h3 className="text-lg font-bold tracking-tight text-neutral-950 sm:text-xl">
            {milestone.title}
          </h3>

          {milestone.description && (
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              {milestone.description}
            </p>
          )}

        </div>

        <span className="w-fit rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
          {milestone.status}
        </span>

      </div>

      {/* =====================================================
          AMOUNT
      ===================================================== */}

      <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">

        <span className="text-xs font-medium text-neutral-500">
          Milestone Amount
        </span>

        <span className="text-sm font-bold text-neutral-950">
          {milestone.amount} ETH
        </span>

      </div>

      {/* =====================================================
          SUBMIT WORK
      ===================================================== */}

      {milestone.status === "FUNDED" && (
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 sm:p-5">

          <div className="mb-4">

            <h4 className="text-sm font-semibold text-neutral-950">
              Submit Your Work
            </h4>

            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Add the link to your completed work and an optional
              note for the client.
            </p>

          </div>

          <div className="space-y-3">

            {/* Submission URL */}

            <div>

              <label
                htmlFor={`submission-url-${milestone.id}`}
                className="mb-2 block text-xs font-semibold text-neutral-700"
              >
                Submission URL
              </label>

              <input
                id={`submission-url-${milestone.id}`}
                type="url"
                value={submissionUrl}
                onChange={(e) =>
                  setSubmissionUrl(e.target.value)
                }
                placeholder="https://github.com/username/project"
                className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:ring-2 focus:ring-red-500/10"
              />

            </div>

            {/* Submission Note */}

            <div>

              <label
                htmlFor={`submission-note-${milestone.id}`}
                className="mb-2 block text-xs font-semibold text-neutral-700"
              >
                Submission Note
                <span className="ml-1 font-normal text-neutral-400">
                  (optional)
                </span>
              </label>

              <textarea
                id={`submission-note-${milestone.id}`}
                value={submissionNote}
                onChange={(e) =>
                  setSubmissionNote(e.target.value)
                }
                placeholder="Add any important information about your submission..."
                rows={4}
                className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:ring-2 focus:ring-red-500/10"
              />

            </div>

            {/* Submit */}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Work
                  <span>→</span>
                </>
              )}
            </button>

          </div>
        </div>
      )}

      {/* =====================================================
          DISPUTE
      ===================================================== */}

      {(milestone.status === "FUNDED" ||
        milestone.status === "SUBMITTED") && (
        <div className="border-t border-neutral-100 pt-5">
          <RaiseDisputeForm
            milestoneId={milestone.id}
          />
        </div>
      )}

      {/* =====================================================
          SUBMITTED
      ===================================================== */}

      {milestone.status === "SUBMITTED" && (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold text-white">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-neutral-950">
                Work Submitted
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                Your submission has been sent to the client.
              </p>
            </div>

          </div>

          {milestone.submissionUrl && (
            <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3">

              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Submission Link
              </p>

              <a
                href={milestone.submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all text-xs font-medium text-red-500 transition hover:text-red-400 hover:underline"
              >
                {milestone.submissionUrl}
              </a>

            </div>
          )}

          {milestone.submissionNote && (
            <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">

              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Note
              </p>

              <p className="text-sm leading-6 text-neutral-600">
                {milestone.submissionNote}
              </p>

            </div>
          )}

        </div>
      )}

      {/* =====================================================
          DISPUTED
      ===================================================== */}

      {milestone.status === "DISPUTED" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

          <div className="flex items-start gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-red-500 shadow-sm">
              !
            </div>

            <div>
              <p className="text-sm font-semibold text-red-900">
                Dispute Raised
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                This milestone is currently under dispute review.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          APPROVED
      ===================================================== */}

      {milestone.status === "APPROVED" && (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">

          <div className="flex items-start gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold text-white">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-neutral-950">
                Milestone Approved
              </p>

              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Waiting for the client to release payment.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          RELEASED
      ===================================================== */}

      {milestone.status === "RELEASED" && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-green-600 shadow-sm">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-green-900">
                Payment Released
              </p>

              <p className="mt-1 text-xs text-green-700">
                The milestone payment has been released successfully.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          REFUNDED
      ===================================================== */}

      {milestone.status === "REFUNDED" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-amber-600 shadow-sm">
              ↩
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-900">
                Milestone Refunded
              </p>

              <p className="mt-1 text-xs text-amber-700">
                This milestone payment has been refunded.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}