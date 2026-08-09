"use client";

import { useParams } from "next/navigation";

import { useJob } from "@/hooks/useJob";
import ApplyForm from "@/components/jobs/ApplyForm";

export default function JobDetailsPage() {
  const params = useParams();

  const jobId = params.jobId as string;

  const { data: job, isLoading } =
    useJob(jobId);

  if (isLoading) {
    return (
      <div className="p-10 text-slate-400">
        Loading...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-10 text-slate-400">
        Job not found
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-4xl font-bold text-white">
          {job.title}
        </h1>

        <p className="text-slate-400">
          {job.description}
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-slate-400 text-sm">
              Budget
            </p>

            <p className="text-white text-xl font-semibold">
              ${job.budget}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-slate-400 text-sm">
              Job Type
            </p>

            <p className="text-white text-xl font-semibold">
              {job.jobType}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Required Skills
          </h3>

          <div className="flex flex-wrap gap-2">
            {job.skills?.map(
              (item: any) => (
                <span
                  key={item.id}
                  className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
                >
                  {item.skill.name}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      <div>
        <ApplyForm jobId={jobId} />
      </div>
    </div>
  );
}