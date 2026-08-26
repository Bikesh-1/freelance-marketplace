"use client";

import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ApplyForm({
  jobId,
}: {
  jobId: string;
}) {
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedAmount, setProposedAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const { data: session, status } = useSession();

  /* ============================================================
     SESSION LOADING
  ============================================================ */

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">

          <div className="h-5 w-40 rounded bg-neutral-200" />

          <div className="h-32 rounded-xl bg-neutral-100" />

          <div className="h-12 rounded-xl bg-neutral-100" />

          <div className="h-12 rounded-xl bg-neutral-200" />

        </div>
      </div>
    );
  }

  /* ============================================================
     NOT LOGGED IN
  ============================================================ */

  if (!session) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          →
        </div>

        <h3 className="mt-4 text-base font-semibold text-neutral-950">
          Ready to apply?
        </h3>

        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Log in to your freelancer account to submit a proposal
          for this project.
        </p>

        <Link
          href="/login"
          className="mt-5 flex w-full items-center justify-center rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
        >
          Login to Apply
        </Link>

      </div>
    );
  }

  /* ============================================================
     CLIENT / OTHER ROLE
  ============================================================ */

  if (session.user.role !== "FREELANCER") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          !
        </div>

        <h3 className="mt-4 text-base font-semibold text-neutral-950">
          Freelancer account required
        </h3>

        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Only freelancers can submit proposals for jobs.
        </p>

      </div>
    );
  }

  /* ============================================================
     APPLY HANDLER
  ============================================================ */

  const applyHandler = async () => {
    if (!coverLetter.trim()) {
      alert("Please write a cover letter.");
      return;
    }

    if (proposedAmount <= 0) {
      alert("Please enter a valid proposed amount.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`/api/jobs/${jobId}/apply`, {
        coverLetter,
        proposedAmount,
      });

      alert("Application submitted successfully");

      setCoverLetter("");
      setProposedAmount(0);
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Failed to apply"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-neutral-100 bg-neutral-950 p-5 text-white sm:p-6">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Your Proposal
            </p>

            <h3 className="mt-1 text-xl font-bold tracking-tight">
              Submit Proposal
            </h3>

            <p className="mt-2 text-xs leading-5 text-neutral-500">
              Tell the client why you're the right person for this
              project.
            </p>

          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
            ↗
          </div>

        </div>

      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <div className="space-y-5 p-5 sm:p-6">

        {/* Cover Letter */}

        <div>

          <div className="mb-2 flex items-center justify-between">

            <label
              htmlFor="coverLetter"
              className="text-xs font-semibold text-neutral-800"
            >
              Cover Letter
            </label>

            <span className="text-[10px] text-neutral-400">
              {coverLetter.length} characters
            </span>

          </div>

          <textarea
            id="coverLetter"
            rows={7}
            placeholder="Introduce yourself, explain your experience, and tell the client how you would approach this project..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            disabled={loading}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="mt-2 text-[10px] leading-4 text-neutral-400">
            Keep your proposal clear, relevant and focused on the
            client's requirements.
          </p>

        </div>

        {/* Proposed Amount */}

        <div>

          <label
            htmlFor="proposedAmount"
            className="mb-2 block text-xs font-semibold text-neutral-800"
          >
            Your Proposed Amount
          </label>

          <div className="relative">

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400">
              $
            </span>

            <input
              id="proposedAmount"
              type="number"
              min="0"
              placeholder="Enter your price"
              value={proposedAmount || ""}
              onChange={(e) =>
                setProposedAmount(
                  Number(e.target.value) || 0
                )
              }
              disabled={loading}
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm font-medium text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />

          </div>

          <p className="mt-2 text-[10px] text-neutral-400">
            Enter the amount you would like to receive for this
            project.
          </p>

        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">

          <div className="flex items-center justify-between">

            <span className="text-xs text-neutral-500">
              Proposed Amount
            </span>

            <span className="text-sm font-bold text-neutral-950">
              ${proposedAmount > 0 ? proposedAmount : "—"}
            </span>

          </div>

        </div>

        {/* =================================================
            SUBMIT BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={applyHandler}
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

              Submitting Proposal...
            </>
          ) : (
            <>
              Submit Proposal

              <span>→</span>
            </>
          )}
        </button>

        {/* Security / Info */}

        <p className="text-center text-[10px] leading-4 text-neutral-400">
          Your proposal will be securely submitted to the client.
        </p>

      </div>
    </div>
  );
}