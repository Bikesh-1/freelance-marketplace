"use client";

import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ApplyForm({ jobId, }: { jobId: string; }) {

  const [coverLetter, setCoverLetter] = useState("");
  const [proposedAmount, setProposedAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  if (!session) {
    return (
      <Link href="/login">
        Login to Apply
      </Link>
    );
  }

  if (session.user.role !== "FREELANCER") {
    return (
      <div>
        Only freelancers can apply to jobs.
      </div>
    );
  }
  const applyHandler = async () => {
    try {
      setLoading(true);

      await axios.post(
        `/api/jobs/${jobId}/apply`,
        {
          coverLetter,
          proposedAmount,
        }
      );

      alert("Application submitted successfully");
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
        "Failed to apply"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h3 className="text-xl font-semibold text-white">
        Submit Proposal
      </h3>

      <textarea
        rows={6}
        placeholder="Write your proposal..."
        className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-white"
        value={coverLetter}
        onChange={(e) =>
          setCoverLetter(
            e.target.value
          )
        }
      />

      <input
        type="number"
        placeholder="Proposed Amount"
        className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-white"
        value={proposedAmount}
        onChange={(e) =>
          setProposedAmount(
            Number(
              e.target.value
            )
          )
        }
      />

      <button
        onClick={applyHandler}
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading
          ? "Submitting..."
          : "Apply Now"}
      </button>
    </div>
  );
}