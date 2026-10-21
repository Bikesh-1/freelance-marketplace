"use client";

import Link from "next/link";
import { useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import JobCard from "@/components/jobs/jobCard";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Loginnavbar from "@/components/layout/loginNavbar";

export default function FreelancerJobsPage() {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [minBudget, setMinBudget] = useState(0);
  const { data: jobs, isLoading, isError, error } = useJobs(search, jobType, minBudget);

  return (
    <>
      <Loginnavbar />
      <DashboardSidebar role="FREELANCER" />
      <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-neutral-900 sm:px-6 lg:py-10 lg:pl-[292px]">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Freelanzo · Freelancer workspace</p>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Find Freelance Jobs</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">Browse open projects, filter by your preferences, and find work that fits your skills.</p>
            </div>
            <Link href="/freelancer/recommendations" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600">Recommended jobs →</Link>
          </header>

          <section aria-label="Search and filter jobs" className="mb-7 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Search</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search job titles..." className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500/10" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Job type</span>
                <select value={jobType} onChange={(event) => setJobType(event.target.value)} className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500/10">
                  <option value="">All job types</option>
                  <option value="FIXED">Fixed price</option>
                  <option value="HOURLY">Hourly</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Minimum budget</span>
                <input type="number" min={0} value={minBudget || ""} onChange={(event) => setMinBudget(Math.max(0, Number(event.target.value) || 0))} placeholder="Any budget" className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500/10" />
              </label>
            </div>
            {(search || jobType || minBudget > 0) && <button type="button" onClick={() => { setSearch(""); setJobType(""); setMinBudget(0); }} className="mt-3 text-xs font-semibold text-neutral-500 transition hover:text-red-500">Clear filters</button>}
          </section>

          {isLoading ? (
            <div role="status" className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">Loading available jobs…</div>
          ) : isError ? (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h2 className="font-semibold text-red-800">Could not load jobs</h2>
              <p className="mt-1 text-sm text-red-700">{error instanceof Error ? error.message : "Please try again."}</p>
            </div>
          ) : !jobs?.length ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
              <h2 className="text-lg font-semibold text-neutral-900">No jobs found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">There are no open jobs matching these filters right now. Try clearing the filters or check back later.</p>
              {(search || jobType || minBudget > 0) && <button type="button" onClick={() => { setSearch(""); setJobType(""); setMinBudget(0); }} className="mt-4 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Clear filters</button>}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between text-sm text-neutral-500">
                <span>{jobs.length} {jobs.length === 1 ? "job" : "jobs"} available</span>
              </div>
              <section className="grid gap-5 lg:grid-cols-2">
                {jobs.map((job: any) => <JobCard key={job.id} job={job} />)}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
