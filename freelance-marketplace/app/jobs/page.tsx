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
    <div className="max-w-7xl mx-auto py-10 px-6">
      <h1 className="text-4xl font-bold text-white mb-8">
        Find Freelance Jobs
      </h1>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <input
          placeholder="Search jobs..."
          className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-white placeholder:text-slate-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-white"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="FIXED">Fixed Price</option>
          <option value="HOURLY">Hourly</option>
        </select>

        <input
          type="number"
          placeholder="Minimum Budget"
          className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-white placeholder:text-slate-500"
          value={minBudget}
          onChange={(e) => setMinBudget(Number(e.target.value))}
        />
      </div>

      {isLoading ? (
        <div className="text-slate-400">
          Loading jobs...
        </div>
      ) : jobs?.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          No jobs found
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs?.map((job: any) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}