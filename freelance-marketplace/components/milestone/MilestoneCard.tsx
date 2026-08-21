"use client";

import { useState } from "react";
import { useEscrow } from "@/hooks/useEscrow";
import { approveMilestone } from "@/services/milestone.action";

type Milestone = {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  status:
    | "PENDING"
    | "FUNDED"
    | "SUBMITTED"
    | "APPROVED"
    | "RELEASED"
    | "REFUNDED";
  escrowId?: string | null;
};

export default function MilestoneCard({
  milestone,
}: {
  milestone: Milestone;
}) {
  const {
  createAndFundEscrow,
  releasePayment,
  loading,
  error,
} = useEscrow();

  // Blockchain escrow index
  // Abhi demo ke liye 0 use kar rahe hain
  // Baad me actual blockchain escrow id store karenge
  const [escrowIndex] = useState(0);

  // TODO: Real freelancer wallet database se aayega
  const freelancerAddress =
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  // Fund milestone
 const handleFund = async () => {
  try {
    await createAndFundEscrow(
      freelancerAddress,
      milestone.amount.toString(),
      milestone.escrowId || ""
    );

    alert(
      "Milestone funded successfully"
    );

    window.location.reload();
  } catch (err) {
    console.error(err);
  }
};

  // Approve milestone + release payment
  const handleApprove = async () => {
    try {
      // Update milestone status to APPROVED
      await approveMilestone(
        milestone.id
      );

      // Release payment from blockchain escrow
      await releasePayment(
        escrowIndex,
        milestone.escrowId || "",
        freelancerAddress,
        milestone.amount
      );

      alert(
        "Payment released successfully"
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-white">
          {milestone.title}
        </h3>

        {milestone.description && (
          <p className="text-slate-400 mt-2">
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

      {/* Fund Milestone */}
      {milestone.status ===
        "PENDING" && (
        <button
          onClick={handleFund}
          disabled={loading}
          className="w-full rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-500 disabled:opacity-50"
        >
          {loading
            ? "Funding..."
            : "Fund Milestone"}
        </button>
      )}

      {/* Approve + Release Payment */}
      {milestone.status ===
        "SUBMITTED" && (
        <button
          onClick={handleApprove}
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading
            ? "Releasing..."
            : "Approve & Release Payment"}
        </button>
      )}

      {/* Released */}
      {milestone.status ===
        "RELEASED" && (
        <div className="rounded-lg bg-green-900/30 border border-green-700 p-3 text-green-300 text-center font-medium">
          Payment Released
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}