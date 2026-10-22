"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

export default function ApplyForm({
  jobId,
}: {
  jobId: string;
}) {
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedAmount, setProposedAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<{
    id: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    proposedBudget: number;
    createdAt: string;
  } | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [applicationError, setApplicationError] = useState("");

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading" || !session || session.user.role !== "FREELANCER") return;
    let cancelled = false;

    const loadApplication = async () => {
      setCheckingApplication(true);
      try {
        const response = await axios.get(`/api/jobs/${jobId}/my-application`);
        if (!cancelled) {
          setApplication(response.data.application ?? null);
          setApplicationError("");
        }
      } catch (error: any) {
        if (!cancelled) {
          if (error?.response?.status === 404) setApplication(null);
          else setApplicationError(error?.response?.data?.message || "Could not check your proposal status.");
        }
      } finally {
        if (!cancelled) setCheckingApplication(false);
      }
    };

    void loadApplication();
    return () => { cancelled = true; };
  }, [jobId, session, status]);

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

  if (checkingApplication) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-neutral-200" />
        <div className="mt-4 h-24 animate-pulse rounded-xl bg-neutral-100" />
      </div>
    );
  }

  if (application) {
    const accepted = application.status === "ACCEPTED";
    const rejected = application.status === "REJECTED";
    return (
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className={`p-5 text-white sm:p-6 ${accepted ? "bg-emerald-950" : rejected ? "bg-red-950" : "bg-neutral-950"}`}>
          <div className="flex items-start gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${accepted ? "bg-emerald-400/15 text-emerald-300" : rejected ? "bg-red-400/15 text-red-300" : "bg-amber-400/15 text-amber-300"}`}>
              {accepted ? "✓" : rejected ? "×" : "↗"}
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Your proposal</p>
              <h3 className="mt-1 text-xl font-bold">
                {accepted ? "Proposal accepted!" : rejected ? "Application not selected" : "Proposal sent successfully"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/65">
                {accepted
                  ? "Great news — the client selected you. Your project conversation is ready."
                  : rejected
                    ? "The client has moved forward with another proposal. You can still explore other projects."
                    : "Your proposal is with the client. You’re all set — we’ll show an update here when they respond."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Proposed amount</p>
              <p className="mt-1 text-xl font-bold text-neutral-950">${application.proposedBudget.toLocaleString()}</p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${accepted ? "bg-emerald-50 text-emerald-700" : rejected ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
              {application.status}
            </span>
          </div>
          {application.createdAt && (
            <p className="text-xs text-neutral-400">
              Submitted {new Date(application.createdAt).toLocaleDateString()}
            </p>
          )}
          {accepted ? (
            <Link href={`/messages/${jobId}`} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-400">
              Message your client <span aria-hidden="true">→</span>
            </Link>
          ) : rejected ? (
            <Link href="/jobs" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-800 transition hover:border-red-200 hover:text-red-500">
              Explore other jobs <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/70 p-4">
              <span className="mt-0.5 text-amber-700">◷</span>
              <div>
                <p className="text-sm font-semibold text-amber-900">Waiting for client response</p>
                <p className="mt-1 text-xs leading-5 text-amber-800/80">Your proposal is saved. Check back here for the latest status.</p>
              </div>
            </div>
          )}
          {applicationError && <p role="alert" className="text-xs text-red-600">{applicationError}</p>}
        </div>
      </section>
    );
  }

  /* ============================================================
     APPLY HANDLER
  ============================================================ */

  const applyHandler = async () => {
    if (!coverLetter.trim()) {
      toast.error("Cover letter required", { description: "Add a short cover letter before submitting your proposal." });
      return;
    }

    if (proposedAmount <= 0) {
      toast.error("Invalid proposal amount", { description: "Enter a proposed amount greater than zero." });
      return;
    }

    try {
      setLoading(true);

      
await axios.post(`/api/jobs/${jobId}/apply`, {
  coverLetter,
  proposedBudget: proposedAmount,
});


      toast.success("Proposal submitted", { description: "Your proposal has been sent to the client." });

      setCoverLetter("");
      setProposedAmount(0);
    } catch (error: any) {
      toast.error("Could not submit proposal", { description: error?.response?.data?.message || "Please try again in a moment." });
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