"use client";

import { useState } from "react";
import axios from "axios";
import TransactionHistory from "@/components/escrow/TransactionHistory";
import { useEscrow } from "@/hooks/useEscrow";
import { approveMilestone } from "@/services/milestone.action";
import RaiseDisputeForm from "@/components/dispute/RaiseDisputeForm";
import { ethers } from "ethers";

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
    status: string;
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

  const [approving, setApproving] = useState(false);
  const [releasing, setReleasing] = useState(false);

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

      if (!ethers.isAddress(freelancerAddress)) {
        throw new Error(
          "Invalid freelancer wallet address"
        );
      }

      if (
        !milestone.amount ||
        milestone.amount <= 0
      ) {
        throw new Error(
          "Invalid milestone amount"
        );
      }

      const result = await createAndFundEscrow(
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
        `Milestone funded successfully.\nBlockchain Escrow ID: ${result.escrowIndex}`
      );

      window.location.reload();
    } catch (err) {
      console.error(
        "Fund milestone error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to fund milestone"
      );
    }
  };

  // -----------------------------------------
  // APPROVE MILESTONE
  // -----------------------------------------

  const handleApprove = async () => {
    try {
      if (milestone.status !== "SUBMITTED") {
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
      if (milestone.status !== "APPROVED") {
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
        err instanceof Error
          ? err.message
          : "Failed to release payment"
      );
    } finally {
      setReleasing(false);
    }
  };

  // -----------------------------------------
  // STATUS STYLING
  // -----------------------------------------

  const statusStyles = {
    PENDING:
      "border border-neutral-200 bg-neutral-50 text-neutral-500",

    FUNDED:
      "border border-red-100 bg-red-50 text-red-500",

    SUBMITTED:
      "border border-blue-100 bg-blue-50 text-blue-600",

    DISPUTED:
      "border border-red-100 bg-red-50 text-red-600",

    APPROVED:
      "border border-amber-100 bg-amber-50 text-amber-600",

    RELEASED:
      "border border-green-100 bg-green-50 text-green-600",

    REFUNDED:
      "border border-neutral-200 bg-neutral-100 text-neutral-600",
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md sm:p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div className="min-w-0">

          <div className="mb-2 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-red-500" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              Milestone
            </span>

          </div>

          <h3 className="text-xl font-bold tracking-tight text-neutral-950">
            {milestone.title}
          </h3>

          {milestone.description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              {milestone.description}
            </p>
          )}

        </div>

        <span
          className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
            statusStyles[milestone.status]
          }`}
        >
          {milestone.status}
        </span>

      </div>

      {/* =====================================================
          AMOUNT
      ===================================================== */}

      <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-5">

        <div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Milestone Amount
          </p>

          <p className="mt-1 text-xl font-bold text-neutral-950">
            {milestone.amount} ETH
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-xs font-bold text-neutral-500">
          ETH
        </div>

      </div>

      {/* =====================================================
          ESCROW
      ===================================================== */}

      {milestone.escrow && (
        <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Escrow
              </p>

              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {milestone.escrow.status}
              </p>

            </div>

            <span className="w-fit rounded-full bg-neutral-950 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              Blockchain
            </span>

          </div>

          <div className="mt-4 border-t border-neutral-200 pt-4">

            <TransactionHistory
              escrowId={
                milestone.escrow.id
              }
            />

          </div>

        </div>
      )}

      {/* =====================================================
          FUND
      ===================================================== */}

      {milestone.status === "PENDING" && (
        <div className="mt-5">

          {!freelancerAddress && (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">

              <p className="text-xs font-medium text-amber-700">
                Freelancer wallet is not connected.
              </p>

            </div>
          )}

          <button
            onClick={handleFund}
            disabled={
              loading ||
              !freelancerAddress
            }
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Funding...
              </>
            ) : (
              <>
                Fund Milestone
                <span>→</span>
              </>
            )}
          </button>

        </div>
      )}

      {/* =====================================================
          APPROVE
      ===================================================== */}

      {milestone.status === "SUBMITTED" && (
        <div className="mt-5">

          <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 p-3">

            <p className="text-xs font-medium text-blue-700">
              Work has been submitted by the freelancer.
            </p>

          </div>

          <button
            onClick={handleApprove}
            disabled={
              loading ||
              approving
            }
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {approving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Approving...
              </>
            ) : (
              <>
                Approve Milestone
                <span>→</span>
              </>
            )}
          </button>

        </div>
      )}

      {/* =====================================================
          RELEASE PAYMENT
      ===================================================== */}

      {milestone.status === "APPROVED" && (
        <div className="mt-5">

          <div className="mb-3 rounded-xl border border-green-100 bg-green-50 p-3">

            <p className="text-xs font-medium text-green-700">
              Milestone approved. Payment is ready to be
              released.
            </p>

          </div>

          <button
            onClick={handleRelease}
            disabled={
              loading ||
              releasing
            }
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {releasing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Releasing Payment...
              </>
            ) : (
              <>
                Release Payment
                <span>→</span>
              </>
            )}
          </button>

        </div>
      )}

      {/* =====================================================
          DISPUTE
      ===================================================== */}

      {(milestone.status === "FUNDED" ||
        milestone.status === "SUBMITTED") && (
        <div className="mt-5 border-t border-neutral-100 pt-5">

          <RaiseDisputeForm
            milestoneId={
              milestone.id
            }
          />

        </div>
      )}

      {/* =====================================================
          RELEASED
      ===================================================== */}

      {milestone.status === "RELEASED" && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
              ✓
            </div>

            <div>

              <p className="text-sm font-semibold text-green-700">
                Payment Released
              </p>

              <p className="mt-1 text-xs text-green-600">
                This milestone has been completed successfully.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          REFUNDED
      ===================================================== */}

      {milestone.status === "REFUNDED" && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-600">
              ↩
            </div>

            <div>

              <p className="text-sm font-semibold text-amber-700">
                Milestone Refunded
              </p>

              <p className="mt-1 text-xs text-amber-600">
                The milestone payment has been refunded.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          DISPUTED
      ===================================================== */}

      {milestone.status === "DISPUTED" && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
              !
            </div>

            <div>

              <p className="text-sm font-semibold text-red-700">
                Dispute Raised
              </p>

              <p className="mt-1 text-xs leading-5 text-red-600">
                This milestone is currently under dispute
                review.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">

          <div className="flex items-start gap-3">

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
              !
            </div>

            <div>

              <p className="text-xs font-semibold text-red-700">
                Transaction Error
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-red-600">
                {error}
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}