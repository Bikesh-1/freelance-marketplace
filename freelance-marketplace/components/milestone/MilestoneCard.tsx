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

            if (
                !ethers.isAddress(
                    freelancerAddress
                )
            ) {
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

            const result =await createAndFundEscrow(freelancerAddress,milestone.amount.toString());
            await axios.post(`/api/milestone/${milestone.id}/fund`,
                {
                    contractAddress:process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS,
                    transactionHash:result.receipt.hash,
                    amount:milestone.amount,
                    network:process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK ||"localhost",
                    blockchainEscrowId:result.escrowIndex,
                }
            );

            alert(`Milestone funded successfully.\nBlockchain Escrow ID: ${result.escrowIndex}`);
            window.location.reload();
        } catch (err) {
            console.error("Fund milestone error:",err);

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

    return (
        <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-white">
                            {milestone.title}
                        </h3>

                        {milestone.description && (
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                {milestone.description}
                            </p>
                        )}
                    </div>

                    <span className="w-fit rounded-full bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200">
                        {milestone.status}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-sm text-slate-400">
                    Milestone Amount
                </span>

                <span className="font-semibold text-white">
                    {milestone.amount} ETH
                </span>
            </div>

            {milestone.escrow && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                            Escrow
                        </span>

                        <span className="text-sm font-medium text-white">
                            {milestone.escrow.status}
                        </span>
                    </div>

                    <div className="mt-4">
                        <TransactionHistory
                            escrowId={
                                milestone.escrow.id
                            }
                        />
                    </div>
                </div>
            )}

            {milestone.status === "PENDING" && (
                <button
                    onClick={handleFund}
                    disabled={
                        loading ||
                        !freelancerAddress
                    }
                    className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Funding..."
                        : "Fund Milestone"}
                </button>
            )}

            {milestone.status === "SUBMITTED" && (
                <button
                    onClick={handleApprove}
                    disabled={
                        loading ||
                        approving
                    }
                    className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                >
                    {approving
                        ? "Approving..."
                        : "Approve Milestone"}
                </button>
            )}

            {milestone.status === "APPROVED" && (
                <button
                    onClick={handleRelease}
                    disabled={
                        loading ||
                        releasing
                    }
                    className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
                >
                    {releasing
                        ? "Releasing Payment..."
                        : "Release Payment"}
                </button>
            )}

            {(milestone.status === "FUNDED" ||
                milestone.status === "SUBMITTED") && (
                    <RaiseDisputeForm
                        milestoneId={milestone.id}
                    />
                )}


            {milestone.status === "RELEASED" && (
                <div className="rounded-xl border border-green-700 bg-green-900/30 p-4 text-center">
                    <p className="font-semibold text-green-300">
                        Payment Released
                    </p>

                    <p className="mt-1 text-sm text-green-400">
                        This milestone has been completed successfully.
                    </p>
                </div>
            )}


            {milestone.status === "REFUNDED" && (
                <div className="rounded-xl border border-yellow-700 bg-yellow-900/30 p-4 text-center">
                    <p className="font-semibold text-yellow-300">
                        Milestone Refunded
                    </p>
                </div>
            )}


            {milestone.status === "DISPUTED" && (
                <div className="rounded-xl border border-red-700 bg-red-900/30 p-4 text-center">
                    <p className="font-semibold text-red-300">
                        Dispute Raised
                    </p>

                    <p className="mt-1 text-sm text-red-400">
                        This milestone is currently under dispute review.
                    </p>
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-800 bg-red-950/30 p-3">
                    <p className="text-sm text-red-400">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}