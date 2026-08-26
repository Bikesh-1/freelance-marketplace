"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Application = {
  id: string;
  coverLetter: string;
  proposedBudget: number;
  status: string;
  freelancer: {
    id: string;
    fullName: string | null;
    title: string;
    experienceLevel: string;
  };
};

export default function ApplicationCard({
  application,
  jobId,
}: {
  application: Application;
  jobId: string;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/jobs/${jobId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId: application.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to accept application"
        );
      }

      alert("Freelancer accepted successfully");

      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to accept application";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/jobs/${jobId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId: application.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to reject application"
        );
      }

      alert("Application rejected");

      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to reject application";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md sm:p-6">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

        {/* =====================================================
            FREELANCER INFO
        ===================================================== */}

        <div className="min-w-0 flex-1">

          {/* Identity */}

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold text-white">
              {application.freelancer.fullName
                ? application.freelancer.fullName
                    .charAt(0)
                    .toUpperCase()
                : "F"}
            </div>

            <div className="min-w-0">

              <h2 className="truncate text-xl font-bold tracking-tight text-neutral-950">
                {application.freelancer.fullName ||
                  "Freelancer"}
              </h2>

              <p className="mt-1 text-sm font-medium text-neutral-700">
                {application.freelancer.title}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  {application.freelancer.experienceLevel}
                </span>

                <span className="text-xs text-neutral-400">
                  Freelancer
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              PROPOSED BUDGET
          ================================================= */}

          <div className="mt-6 rounded-xl border border-neutral-100 bg-neutral-50 p-4">

            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Proposed Budget
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
              ${application.proposedBudget}
            </p>

          </div>

          {/* =================================================
              COVER LETTER
          ================================================= */}

          <div className="mt-6">

            <div className="flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-red-500" />

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Cover Letter
              </p>

            </div>

            <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4">

              <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                {application.coverLetter}
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            RIGHT ACTION PANEL
        ===================================================== */}

        <div className="w-full lg:w-64 lg:shrink-0">

          {/* Status */}

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">

            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Application Status
            </p>

            <div className="mt-3">

              <span className="inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                {application.status}
              </span>

            </div>

          </div>

          {/* Actions */}

          <div className="mt-4 space-y-3">

            {/* Profile */}

            <Link
              href={`/freelancer/${application.freelancer.id}`}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-red-500"
            >
              View Freelancer Profile
              <span>→</span>
            </Link>
            {application.status === "PENDING" && (
              <>

                {/* Reject */}

                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reject Application
                </button>

                {/* Accept */}

                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Accept Freelancer
                      <span>→</span>
                    </>
                  )}
                </button>

              </>
            )}

          </div>

        </div>

      </div>

    </article>
  );
}