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
    `/api/applications/${application.id}/accept`,
    {
      method: "POST",
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
    `/api/applications/${application.id}/reject`,
    {
      method: "POST",
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

return ( <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"> <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between"> <div className="flex-1"> <h2 className="text-2xl font-semibold text-white">
{application.freelancer.fullName || "Freelancer"} </h2>

      <p className="mt-1 text-slate-300">
        {application.freelancer.title}
      </p>

      <p className="mt-1 text-sm text-slate-400">
        {application.freelancer.experienceLevel}
      </p>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-300">
          Proposed Budget
        </p>

        <p className="mt-1 text-xl font-semibold text-white">
          ${application.proposedBudget}
        </p>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-slate-300">
          Cover Letter
        </p>

        <p className="mt-2 whitespace-pre-wrap text-slate-400">
          {application.coverLetter}
        </p>
      </div>
    </div>
    <div className="w-full md:w-64">
      <div className="rounded-xl border border-slate-800 p-4">
        <p className="text-sm text-slate-400">Status</p>

        <div className="mt-2">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
            {application.status}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <Link
          href={`/freelancer/${application.freelancer.id}`}
          className="rounded-lg border border-slate-700 px-4 py-2 text-center text-sm font-medium text-white hover:border-slate-600"
        >
          View Profile
        </Link>

        {application.status === "PENDING" && (
          <>
            <button
              onClick={handleReject}
              disabled={loading}
              className="rounded-lg border border-red-600 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/10 disabled:opacity-50"
            >
              Reject
            </button>

            <button
              onClick={handleAccept}
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : "Accept Freelancer"}
            </button>
          </>
        )}
      </div>
    </div>
  </div>
</div>

);
}
