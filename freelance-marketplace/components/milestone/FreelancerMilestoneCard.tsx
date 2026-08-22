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
  const [submissionNote, setSubmissionNote] =
    useState(
      milestone.submissionNote || ""
    );

  const [submissionUrl, setSubmissionUrl] =
    useState(
      milestone.submissionUrl || ""
    );

  const [submitting, setSubmitting] =
    useState(false);

  // -----------------------------------------
  // SUBMIT MILESTONE
  // -----------------------------------------

  const handleSubmit = async () => {
    try {
      if (!submissionUrl.trim()) {
        alert(
          "Submission URL is required"
        );
        return;
      }

      setSubmitting(true);

      await submitMilestone(
        milestone.id,
        {
          submissionUrl:
            submissionUrl.trim(),

          submissionNote:
            submissionNote.trim() ||
            undefined,
        }
      );

      alert(
        "Milestone submitted successfully"
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "Submit milestone error:",
        error
      );

      alert(
        "Failed to submit milestone"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">

      {/* -------------------------------- */}
      {/* TITLE */}
      {/* -------------------------------- */}

      <div>
        <h3 className="text-xl font-semibold text-white">
          {milestone.title}
        </h3>

        {milestone.description && (
          <p className="mt-2 text-slate-400">
            {milestone.description}
          </p>
        )}
      </div>

      {/* -------------------------------- */}
      {/* AMOUNT */}
      {/* -------------------------------- */}

      <div className="flex items-center justify-between">
        <span className="text-slate-300">
          Amount
        </span>

        <span className="font-medium text-white">
          {milestone.amount} ETH
        </span>
      </div>

      {/* -------------------------------- */}
      {/* STATUS */}
      {/* -------------------------------- */}

      <div className="flex items-center justify-between">
        <span className="text-slate-300">
          Status
        </span>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
          {milestone.status}
        </span>
      </div>

      {/* -------------------------------- */}
      {/* FUNDED → SUBMIT WORK */}
      {/* -------------------------------- */}

      {milestone.status === "FUNDED" && (
        <div className="space-y-3">

          <input
            type="url"
            value={submissionUrl}
            onChange={(e) =>
              setSubmissionUrl(
                e.target.value
              )
            }
            placeholder="Submission URL"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
          />

          <textarea
            value={submissionNote}
            onChange={(e) =>
              setSubmissionNote(
                e.target.value
              )
            }
            placeholder="Submission note (optional)"
            rows={4}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
          />

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {submitting
              ? "Submitting..."
              : "Submit Work"}
          </button>
        </div>
      )}

      {/* -------------------------------- */}
      {/* FUNDED / SUBMITTED → DISPUTE */}
      {/* -------------------------------- */}

      {(milestone.status === "FUNDED" ||
        milestone.status === "SUBMITTED") && (
        <RaiseDisputeForm
          milestoneId={milestone.id}
        />
      )}

      {/* -------------------------------- */}
      {/* SUBMITTED → SHOW WORK */}
      {/* -------------------------------- */}

      {milestone.status === "SUBMITTED" && (
        <div className="space-y-3 rounded-lg border border-slate-700 p-4">

          <p className="text-sm font-medium text-slate-400">
            Work Submitted
          </p>

          {milestone.submissionUrl && (
            <a
              href={
                milestone.submissionUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="block break-all text-indigo-400 hover:underline"
            >
              {milestone.submissionUrl}
            </a>
          )}

          {milestone.submissionNote && (
            <p className="text-sm text-slate-300">
              {milestone.submissionNote}
            </p>
          )}
        </div>
      )}

      {/* -------------------------------- */}
      {/* DISPUTED */}
      {/* -------------------------------- */}

      {milestone.status === "DISPUTED" && (
        <div className="rounded-lg border border-red-700 bg-red-900/30 p-4 text-center">
          <p className="font-medium text-red-300">
            Dispute Raised
          </p>

          <p className="mt-1 text-sm text-red-400">
            This milestone is currently under dispute review.
          </p>
        </div>
      )}

      {/* -------------------------------- */}
      {/* APPROVED */}
      {/* -------------------------------- */}

      {milestone.status === "APPROVED" && (
        <div className="rounded-lg border border-indigo-700 bg-indigo-900/30 p-4 text-center">
          <p className="font-medium text-indigo-300">
            Milestone Approved
          </p>

          <p className="mt-1 text-sm text-indigo-400">
            Waiting for client to release payment.
          </p>
        </div>
      )}

      {/* -------------------------------- */}
      {/* RELEASED */}
      {/* -------------------------------- */}

      {milestone.status === "RELEASED" && (
        <div className="rounded-lg border border-green-700 bg-green-900/30 p-3 text-center font-medium text-green-300">
          Payment Released
        </div>
      )}


      {milestone.status === "REFUNDED" && (
        <div className="rounded-lg border border-yellow-700 bg-yellow-900/30 p-3 text-center font-medium text-yellow-300">
          Milestone Refunded
        </div>
      )}
    </div>
  );
}