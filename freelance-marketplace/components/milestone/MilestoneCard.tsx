"use client";

import { useState } from "react";
import axios from "axios";
import TransactionHistory from "@/components/escrow/TransactionHistory";
import { useEscrow } from "@/hooks/useEscrow";
import { approveMilestone } from "@/services/milestone.action";
import RaiseDisputeForm from "@/components/dispute/RaiseDisputeForm";
type Milestone = {
  id: string;
  title: string;
  description?: string | null;
  amount: number;

  status:
    | "PENDING"
    | "FUNDED"
    | "SUBMITTED"
    | "DISPUTED"
    | "APPROVED"
    | "RELEASED"
    | "REFUNDED";

  escrowId?: string | null;

  escrow?: {
    id: string;
    blockchainEscrowId: number | null;
  } | null;
};

export default function MilestoneCard({
  milestone,
  freelancerAddress,
}: {
  milestone: Milestone;
  freelancerAddress?: string | null;
}) {
  const {
    createAndFundEscrow,
    releasePayment,
    loading,
    error,
  } = useEscrow();

  const [approving, setApproving] =
    useState(false);

  const [releasing, setReleasing] =
    useState(false);

  // -----------------------------------------
  // FUND MILESTONE
  // -----------------------------------------

  const handleFund = async () => {
    try {
      if (!freelancerAddress) {
        throw new Error(
          "Freelancer wallet address not found"
        );
      }

      const result =
        await createAndFundEscrow(
          freelancerAddress,
          milestone.amount.toString()
        );

      await axios.post(
        `/api/milestone/${milestone.id}/fund`,
        {
          contractAddress:
            process.env
              .NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS,

          transactionHash:
            result.receipt.hash,

          amount: milestone.amount,

          network: "hardhat-local",

          blockchainEscrowId:
            result.escrowIndex,
        }
      );

      alert(
        "Milestone funded successfully"
      );

      window.location.reload();
    } catch (err) {
      console.error(
        "Fund milestone error:",
        err
      );
    }
  };

  // -----------------------------------------
  // APPROVE MILESTONE
  // -----------------------------------------

  const handleApprove = async () => {
    try {
      if (
        milestone.status !== "SUBMITTED"
      ) {
        return;
      }

      setApproving(true);

      await approveMilestone(
        milestone.id
      );

      alert(
        "Milestone approved successfully"
      );

      window.location.reload();
    } catch (err) {
      console.error(
        "Approve milestone error:",
        err
      );

      alert(
        "Failed to approve milestone"
      );
    } finally {
      setApproving(false);
    }
  };

  // -----------------------------------------
  // RELEASE PAYMENT
  // -----------------------------------------

  const handleRelease = async () => {
    try {
      if (
        milestone.status !== "APPROVED"
      ) {
        return;
      }

      if (!milestone.escrow) {
        throw new Error(
          "Escrow not found"
        );
      }

      if (!freelancerAddress) {
        throw new Error(
          "Freelancer wallet address not found"
        );
      }

      const escrowIndex =
        milestone.escrow
          .blockchainEscrowId;

      if (
        escrowIndex === null ||
        escrowIndex === undefined
      ) {
        throw new Error(
          "Blockchain escrow ID not found"
        );
      }

      setReleasing(true);

      await releasePayment(
        escrowIndex,
        milestone.escrow.id,
        freelancerAddress,
        milestone.amount
      );

      alert(
        "Payment released successfully"
      );

      window.location.reload();
    } catch (err) {
      console.error(
        "Release payment error:",
        err
      );

      alert(
        "Failed to release payment"
      );
    } finally {
      setReleasing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      {/* Header */}
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
{milestone.escrow && (
  <TransactionHistory
    escrowId={
      milestone.escrow.id
    }
  />
)}
      {/* Amount */}
      <div className="flex items-center justify-between">
        <span className="text-slate-300">
          Amount
        </span>

        <span className="font-medium text-white">
          {milestone.amount} ETH
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-slate-300">
          Status
        </span>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
          {milestone.status}
        </span>
      </div>

      {/* -------------------------------- */}
      {/* FUND */}
      {/* -------------------------------- */}

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

      {/* -------------------------------- */}
      {/* APPROVE */}
      {/* -------------------------------- */}

      {milestone.status ===
        "SUBMITTED" && (
        <button
          onClick={handleApprove}
          disabled={
            loading || approving
          }
          className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {approving
            ? "Approving..."
            : "Approve Milestone"}
        </button>
      )}

      {/* -------------------------------- */}
      {/* RELEASE */}
      {/* -------------------------------- */}

      {milestone.status ===
        "APPROVED" && (
        <button
          onClick={handleRelease}
          disabled={
            loading || releasing
          }
          className="w-full rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-500 disabled:opacity-50"
        >
          {releasing
            ? "Releasing..."
            : "Release Payment"}
        </button>
      )}

      {/* -------------------------------- */}
      {/* RELEASED */}
      {/* -------------------------------- */}
      {(milestone.status === "FUNDED" ||
      milestone.status === "SUBMITTED"
    ) && (
  <RaiseDisputeForm
    milestoneId={milestone.id}
  />
)}
      {milestone.status ===
        "RELEASED" && (
        <div className="rounded-lg border border-green-700 bg-green-900/30 p-3 text-center font-medium text-green-300">
          Payment Released
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}