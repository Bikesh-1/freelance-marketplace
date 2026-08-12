"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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

return (
<> <Navbar />

```
  <main className="mx-auto max-w-6xl px-6 py-10">
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Job Applications
        </h1>

        <p className="mt-2 text-slate-400">
          Review freelancers who applied for this job
        </p>
      </div>

      <Link
        href="/client/jobs"
        className="rounded-xl border border-slate-700 px-4 py-2 text-white hover:border-slate-600"
      >
        Back to My Jobs
      </Link>
    </div>

    {isLoading ? (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
        Loading applications...
      </div>
    ) : applications?.length === 0 ? (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
        <h2 className="text-2xl font-semibold text-white">
          No applications yet
        </h2>

        <p className="mt-2 text-slate-400">
          Freelancers will appear here once they apply to this job.
        </p>
      </div>
    ) : (
      <div className="grid gap-6">
        {applications.map((application: any) => (
          <ApplicationCard
            key={application.id}
            application={application}
            jobId={jobId}
          />
        ))}
      </div>
    )}
  </main>
</>
);
}
