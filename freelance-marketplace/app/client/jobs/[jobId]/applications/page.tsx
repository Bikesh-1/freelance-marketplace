"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import Navbar from "@/components/layout/navbar";
import { useApplications } from "@/hooks/useApplications";
import ApplicationCard from "@/components/client/ApplicationCard";

export default function ApplicationsPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const {
    data: applications,
    isLoading,
  } = useApplications(jobId);
  const queryClient = useQueryClient();
  const [ranking, setRanking] = useState(false);
  const [rankMessage, setRankMessage] = useState("");
  const [rankError, setRankError] = useState(false);

  const handleRankApplications = async () => {
    setRanking(true);
    setRankMessage("");
    setRankError(false);

    try {
      const response = await fetch(`/api/jobs/${jobId}/rank-applications`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "AI ranking failed.");
      }

      await queryClient.invalidateQueries({ queryKey: ["applications", jobId] });
      setRankMessage(
        `AI scored the top ${result.count} freelancer(s) from ${result.evaluatedCount} evaluated application(s). Applications are sorted by match score.${
          result.truncated ? " The service limit means only the first 300 applications were evaluated." : ""
        }`
      );
    } catch (error) {
      setRankError(true);
      setRankMessage(error instanceof Error ? error.message : "AI ranking failed. Please try again.");
    } finally {
      setRanking(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <section className="mb-8">

            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Client Workspace
              </span>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                  Job Applications
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                  Review freelancers who applied for this job and
                  choose the right candidate for your project.
                </p>

              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/client/jobs"
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:text-red-500"
                >
                  <span>←</span>
                  Back to My Jobs
                </Link>
                <button
                  type="button"
                  onClick={handleRankApplications}
                  disabled={ranking || isLoading || !applications?.length}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ranking ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Ranking...
                    </>
                  ) : (
                    <>✦ Rank with AI</>
                  )}
                </button>
              </div>

            </div>

          </section>

          {rankMessage && (
            <div
              role="status"
              className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                rankError
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {rankMessage}
            </div>
          )}

          {/* =====================================================
              APPLICATION SUMMARY
          ===================================================== */}

          {!isLoading && applications && applications.length > 0 && (
            <section className="mb-6 grid gap-3 sm:grid-cols-3">

              {/* Total */}

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Total Applications
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                  {applications.length}
                </p>

              </div>

              {/* Pending */}

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Pending Review
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                  {
                    applications.filter(
                      (application: any) =>
                        application.status === "PENDING"
                    ).length
                  }
                </p>

              </div>

              {/* Accepted */}

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Accepted
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                  {
                    applications.filter(
                      (application: any) =>
                        application.status === "ACCEPTED"
                    ).length
                  }
                </p>

              </div>

            </section>
          )}

          {/* =====================================================
              LOADING
          ===================================================== */}

          {isLoading ? (

            <section className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-red-500" />

              <p className="mt-4 text-sm font-medium text-neutral-600">
                Loading applications...
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                Please wait while we fetch the latest applications.
              </p>

            </section>

          ) : applications?.length === 0 ? (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <section className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-400">
                —
              </div>

              <h2 className="mt-5 text-lg font-semibold text-neutral-950">
                No applications yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Freelancers will appear here once they apply to this
                job.
              </p>

              <Link
                href="/client/jobs"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-xs font-semibold text-white transition hover:bg-red-400"
              >
                View My Jobs
                <span>→</span>
              </Link>

            </section>

          ) : (

            /* =================================================
               APPLICATION LIST
            ================================================= */

            <section className="space-y-4">

              {[...(applications ?? [])]
                .sort((a: any, b: any) => (b.aiScore ?? -1) - (a.aiScore ?? -1))
                .map((application: any) => (

                <div
                  key={application.id}
                  className="rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:shadow-md"
                >

                  <ApplicationCard
                    application={application}
                    jobId={jobId}
                  />

                </div>

              ))}

            </section>

          )}

        </div>

      </main>
    </>
  );
}