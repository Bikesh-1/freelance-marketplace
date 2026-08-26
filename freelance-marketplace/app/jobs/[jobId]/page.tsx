"use client";

import { useParams } from "next/navigation";
import { useJob } from "@/hooks/useJob";
import ApplyForm from "@/components/jobs/ApplyForm";

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const { data: job, isLoading } = useJob(jobId);

  /* ============================================================
     LOADING
  ============================================================ */

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

          <div className="grid gap-6 lg:grid-cols-3">

            <div className="space-y-6 lg:col-span-2">

              <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="h-7 w-2/3 rounded bg-neutral-200" />

                <div className="mt-5 space-y-2">
                  <div className="h-3 w-full rounded bg-neutral-100" />
                  <div className="h-3 w-5/6 rounded bg-neutral-100" />
                  <div className="h-3 w-4/6 rounded bg-neutral-100" />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="h-24 rounded-xl bg-neutral-100" />
                  <div className="h-24 rounded-xl bg-neutral-100" />
                </div>
              </div>

              <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="h-5 w-40 rounded bg-neutral-200" />

                <div className="mt-5 flex gap-2">
                  <div className="h-8 w-20 rounded-lg bg-neutral-100" />
                  <div className="h-8 w-24 rounded-lg bg-neutral-100" />
                  <div className="h-8 w-20 rounded-lg bg-neutral-100" />
                </div>
              </div>

            </div>

            <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="h-6 w-40 rounded bg-neutral-200" />

              <div className="mt-6 space-y-4">
                <div className="h-12 rounded-xl bg-neutral-100" />
                <div className="h-12 rounded-xl bg-neutral-100" />
                <div className="h-12 rounded-xl bg-neutral-100" />
              </div>
            </div>

          </div>
        </div>
      </main>
    );
  }

  /* ============================================================
     NOT FOUND
  ============================================================ */

  if (!job) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">

          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl text-red-500">
              !
            </div>

            <h1 className="mt-5 text-xl font-bold text-neutral-950">
              Job not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              This job may have been removed or is no longer available.
            </p>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="mb-8">

          <div className="mb-3 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-red-500" />

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Job Details
            </span>

          </div>

          <p className="text-xs text-neutral-400">
            Explore this project and submit your proposal.
          </p>

        </div>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid items-start gap-6 lg:grid-cols-3">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="space-y-6 lg:col-span-2">

            {/* Job Overview */}

            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">

              {/* Title */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div className="min-w-0">

                  <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                    {job.title}
                  </h1>

                  <p className="mt-2 text-sm text-neutral-500">
                    Review the project requirements before applying.
                  </p>

                </div>

                {/* Job Type */}

                <span className="w-fit shrink-0 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-red-500">
                  {job.jobType === "FIXED"
                    ? "Fixed Price"
                    : job.jobType === "HOURLY"
                      ? "Hourly"
                      : job.jobType}
                </span>

              </div>

              {/* Description */}

              <div className="mt-7 border-t border-neutral-100 pt-6">

                <div className="mb-3 flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                  <h2 className="text-sm font-semibold text-neutral-950">
                    Project Description
                  </h2>

                </div>

                <p className="whitespace-pre-line text-sm leading-7 text-neutral-600">
                  {job.description}
                </p>

              </div>

            </section>

            {/* =================================================
                JOB INFO
            ================================================= */}

            <section className="grid gap-3 sm:grid-cols-2">

              {/* Budget */}

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                      Budget
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                      ${job.budget}
                    </p>

                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-sm font-bold text-red-500">
                    $
                  </div>

                </div>

                <p className="mt-2 text-xs text-neutral-400">
                  Project budget
                </p>

              </div>

              {/* Job Type */}

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                      Job Type
                    </p>

                    <p className="mt-2 text-xl font-bold tracking-tight text-neutral-950">
                      {job.jobType === "FIXED"
                        ? "Fixed Price"
                        : job.jobType === "HOURLY"
                          ? "Hourly"
                          : job.jobType}
                    </p>

                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-600">
                    ◷
                  </div>

                </div>

                <p className="mt-2 text-xs text-neutral-400">
                  Payment structure
                </p>

              </div>

            </section>

            {/* =================================================
                REQUIRED SKILLS
            ================================================= */}

            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-red-500" />

                <div>

                  <h2 className="text-base font-semibold text-neutral-950">
                    Required Skills
                  </h2>

                  <p className="mt-1 text-xs text-neutral-500">
                    Skills and technologies required for this project.
                  </p>

                </div>

              </div>

              {job.skills && job.skills.length > 0 ? (

                <div className="mt-5 flex flex-wrap gap-2">

                  {job.skills.map((item: any) => (

                    <span
                      key={item.id}
                      className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    >
                      {item.skill.name}
                    </span>

                  ))}

                </div>

              ) : (

                <div className="mt-5 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 text-center">

                  <p className="text-xs text-neutral-400">
                    No specific skills listed for this project.
                  </p>

                </div>

              )}

            </section>

            {/* =================================================
                APPLY INFO
            ================================================= */}

            <section className="rounded-2xl bg-neutral-950 p-5 text-white shadow-sm sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    Interested in this project?
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    Send your proposal
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Tell the client why you're the right freelancer for
                    this job.
                  </p>

                </div>

                <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 sm:flex">
                  →
                </div>

              </div>

            </section>

          </div>

          {/* =================================================
              RIGHT — APPLY FORM
          ================================================= */}

          <aside className="lg:sticky lg:top-6">

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">

              {/* Apply Header */}

              <div className="border-b border-neutral-100 bg-neutral-950 p-5 text-white sm:p-6">

                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Application
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Apply for this job
                </h2>

                <p className="mt-2 text-xs leading-5 text-neutral-500">
                  Submit your proposal and let the client know how you
                  can help.
                </p>

              </div>

              {/* Form */}

              <div className="p-5 sm:p-6">
                <ApplyForm jobId={jobId} />
              </div>

            </div>

          </aside>

        </div>

      </div>
    </main>
  );
}