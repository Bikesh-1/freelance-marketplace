"use client";

import { useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import JobCard from "../../components/jobs/jobCard";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [minBudget, setMinBudget] = useState(0);

  const { data: jobs, isLoading } = useJobs(
    search,
    jobType,
    minBudget
  );

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />

                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Freelance Marketplace
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                Find Freelance Jobs
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                Discover projects that match your skills, budget and
                preferred working style.
              </p>
            </div>

            {!isLoading && (
              <div className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-500 shadow-sm">
                {jobs?.length || 0}{" "}
                {jobs?.length === 1 ? "job" : "jobs"} available
              </div>
            )}

          </div>
        </section>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="text-sm font-semibold text-neutral-950">
                Search & Filter
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                Narrow down jobs based on your preferences.
              </p>
            </div>

            {(search || jobType || minBudget > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setJobType("");
                  setMinBudget(0);
                }}
                className="text-xs font-semibold text-neutral-500 transition hover:text-red-500"
              >
                Clear filters
              </button>
            )}

          </div>

          <div className="grid gap-3 md:grid-cols-3">

            {/* Search */}

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10"
              />
            </div>

            {/* Job Type */}

            <div className="relative">
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 pr-10 text-sm text-neutral-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10"
              >
                <option value="">All Job Types</option>
                <option value="FIXED">Fixed Price</option>
                <option value="HOURLY">Hourly</option>
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                ▼
              </span>
            </div>

            {/* Minimum Budget */}

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                $
              </span>

              <input
                type="number"
                min="0"
                placeholder="Minimum budget"
                value={minBudget || ""}
                onChange={(e) =>
                  setMinBudget(Number(e.target.value) || 0)
                }
                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10"
              />
            </div>

          </div>

          {/* Active filters */}

          {(search || jobType || minBudget > 0) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">

              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Active filters:
              </span>

              {search && (
                <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700">
                  Search: {search}
                </span>
              )}

              {jobType && (
                <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500">
                  {jobType === "FIXED"
                    ? "Fixed Price"
                    : "Hourly"}
                </span>
              )}

              {minBudget > 0 && (
                <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700">
                  Min. ${minBudget}
                </span>
              )}

            </div>
          )}

        </section>

        {/* =====================================================
            RESULTS HEADER
        ===================================================== */}

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="text-base font-semibold text-neutral-950">
              Available Jobs
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Browse opportunities and find your next project.
            </p>
          </div>

          {!isLoading && jobs && jobs.length > 0 && (
            <span className="hidden text-xs text-neutral-400 sm:block">
              Showing {jobs.length} results
            </span>
          )}

        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {isLoading ? (
          <div className="grid gap-4">

            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex-1">
                    <div className="h-5 w-2/3 rounded bg-neutral-200" />

                    <div className="mt-3 h-3 w-1/3 rounded bg-neutral-100" />

                    <div className="mt-5 flex gap-2">
                      <div className="h-6 w-20 rounded-full bg-neutral-100" />
                      <div className="h-6 w-24 rounded-full bg-neutral-100" />
                    </div>
                  </div>

                  <div className="h-10 w-28 rounded-xl bg-neutral-200" />

                </div>
              </div>
            ))}

          </div>

        ) : jobs?.length === 0 ? (

          /* =====================================================
             EMPTY STATE
          ===================================================== */

          <section className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-400">
              ⌕
            </div>

            <h3 className="mt-5 text-base font-semibold text-neutral-900">
              No jobs found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              We couldn't find any jobs matching your current filters.
              Try changing your search or clearing the filters.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setJobType("");
                setMinBudget(0);
              }}
              className="mt-5 rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
            >
              Clear Filters
            </button>

          </section>

        ) : (

          /* =====================================================
             JOB RESULTS
          ===================================================== */

          <div className="grid gap-4">

            {jobs?.map((job: any) => (
              <div
                key={job.id}
                className="group rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm transition duration-200 hover:border-neutral-300 hover:shadow-md"
              >
                <JobCard job={job} />
              </div>
            ))}

          </div>

        )}

      </div>
    </main>
  );
}