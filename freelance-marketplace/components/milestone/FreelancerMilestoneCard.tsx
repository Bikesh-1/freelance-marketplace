"use client";

import { useState } from "react";
import { submitMilestone } from "@/services/milestone.action";

export default function FreelancerMilestoneCard({
  milestone,
}: {
  milestone: any;
}) {
  const [open, setOpen] = useState(false);
  const [submissionNote, setSubmissionNote] =
    useState(
      milestone.submissionNote || ""
    );
  const [submissionUrl, setSubmissionUrl] =
    useState(
      milestone.submissionUrl || ""
    );
  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async () => {
    try {
      if (
        !submissionNote.trim() &&
        !submissionUrl.trim()
      ) {
        alert(
          "Please add work details or a work URL"
        );
        return;
      }

      setLoading(true);

      await submitMilestone(
        milestone.id,
        {
          submissionNote,
          submissionUrl,
        }
      );

      alert(
        "Work submitted successfully"
      );

      window.location.reload();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to submit work"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div>
        <h3 className="text-xl font-semibold text-white">
          {milestone.title}
        </h3>

        {milestone.description && (
          <p className="mt-2 text-slate-400">
            {milestone.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-slate-300">
          Amount
        </span>

        <span className="font-medium text-white">
          {milestone.amount} ETH
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-slate-300">
          Status
        </span>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
          {milestone.status}
        </span>
      </div>

      {milestone.status === "FUNDED" && (
        <>
          {!open ? (
            <button
              onClick={() => setOpen(true)}
              className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-500"
            >
              Submit Work
            </button>
          ) : (
            <div className="space-y-4 rounded-xl border border-slate-700 p-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Work Description
                </label>

                <textarea
                  value={submissionNote}
                  onChange={(e) =>
                    setSubmissionNote(
                      e.target.value
                    )
                  }
                  placeholder="Describe the completed work..."
                  rows={5}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Work URL
                </label>

                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) =>
                    setSubmissionUrl(
                      e.target.value
                    )
                  }
                  placeholder="https://github.com/..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="w-1/2 rounded-lg border border-slate-700 py-3 font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-1/2 rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Work"}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {milestone.status === "SUBMITTED" && (
        <div className="space-y-3 rounded-lg border border-yellow-700 bg-yellow-900/20 p-4">
          <p className="font-medium text-yellow-300">
            Work submitted — waiting for client approval
          </p>

          {milestone.submissionNote && (
            <p className="text-sm text-slate-300">
              {milestone.submissionNote}
            </p>
          )}

          {milestone.submissionUrl && (
            <a
              href={milestone.submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-indigo-400 hover:text-indigo-300"
            >
              View Submitted Work →
            </a>
          )}
        </div>
      )}

      {milestone.status === "RELEASED" && (
        <div className="rounded-lg border border-green-700 bg-green-900/30 p-3 text-center font-medium text-green-300">
          Payment Released
        </div>
      )}
    </div>
  );
}