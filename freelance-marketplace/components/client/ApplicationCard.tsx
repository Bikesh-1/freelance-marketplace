"use client";

import axios from "axios";

export default function ApplicationCard({
  application,
  jobId,
}: {
  application: any;
  jobId: string;
}) {
  const acceptHandler = async () => {
    await axios.post(
      `/api/client/jobs/${jobId}/accept`,
      {
        applicationId: application.id,
      }
    );

    window.location.reload();
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-white">
            {
              application.freelancer
                .fullName
            }
          </h3>

          <p className="text-slate-400">
            {
              application.freelancer
                .title
            }
          </p>
        </div>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
          {application.status}
        </span>
      </div>

      <div>
        <p className="text-sm text-slate-400 mb-1">
          Proposed Budget
        </p>

        <p className="text-2xl font-bold text-white">
          $
          {
            application.proposedBudget
          }
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400 mb-2">
          Cover Letter
        </p>

        <p className="text-slate-300 whitespace-pre-line">
          {
            application.coverLetter
          }
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {application.freelancer.skills?.map(
          (item: any) => (
            <span
              key={item.skill.id}
              className="rounded-full bg-indigo-600/20 px-3 py-1 text-sm text-indigo-300"
            >
              {item.skill.name}
            </span>
          )
        )}
      </div>

      {application.status ===
        "PENDING" && (
        <button
          onClick={acceptHandler}
          className="w-full rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-500"
        >
          Accept Freelancer
        </button>
      )}
    </div>
  );
}