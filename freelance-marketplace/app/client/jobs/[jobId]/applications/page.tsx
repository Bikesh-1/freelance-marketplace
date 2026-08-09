"use client";

import { useParams } from "next/navigation";

import { useApplications } from "@/hooks/useApplications";
import ApplicationCard from "@/components/client/ApplicationCard";

export default function ApplicationsPage() {
  const params = useParams();

  const jobId = params.jobId as string;

  const {
    data: applications,
    isLoading,
  } = useApplications(jobId);

  if (isLoading) {
    return (
      <div className="p-10 text-slate-400">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-white mb-8">
        Job Applications
      </h1>

      <div className="grid gap-6">
        {applications?.map(
          (application: any) => (
            <ApplicationCard
              key={application.id}
              application={
                application
              }
              jobId={jobId}
            />
          )
        )}
      </div>
    </div>
  );
}