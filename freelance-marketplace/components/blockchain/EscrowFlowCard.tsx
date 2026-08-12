"use client";

import { useState } from "react";

import { useEscrow } from "@/hooks/useEscrow";

export default function EscrowFlowCard({
  jobId,
  freelancerAddress,
  prismaEscrowId,
}: {
  jobId: string;
  freelancerAddress: string;
  prismaEscrowId: string;
}) {
  const {
    createEscrow,
    fundEscrow,
    releasePayment,
    refundPayment,
    loading,
    error,
  } = useEscrow();

  const [escrowId, setEscrowId] =
    useState(0);

  const [amount, setAmount] =
    useState("0.1");

  const handleCreate = async () => {
    await createEscrow(
      freelancerAddress,
      jobId
    );

    alert(
      "Escrow created successfully"
    );
  };

  const handleFund = async () => {
    await fundEscrow(
      escrowId,
      amount,
      prismaEscrowId
    );

    alert(
      "Escrow funded successfully"
    );
  };

  const handleRelease = async () => {
    await releasePayment(
      escrowId,
      prismaEscrowId,
      freelancerAddress,
      Number(amount)
    );

    alert(
      "Payment released successfully"
    );
  };

  const handleRefund = async () => {
    await refundPayment(escrowId, prismaEscrowId);

    alert(
      "Refund completed successfully"
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
      <h2 className="text-2xl font-bold text-white">
        Escrow Payment Flow
      </h2>

      <div className="space-y-3">
        <p className="text-slate-300">
          <strong className="text-white">
            Job ID:
          </strong>
          {jobId}
        </p>

        <p className="text-slate-300 break-all">
          <strong className="text-white">
            Freelancer Wallet:
          </strong>
          {freelancerAddress}
        </p>
      </div>

      <input
        type="number"
        value={escrowId}
        onChange={(e) =>
          setEscrowId(
            Number(
              e.target.value
            )
          )
        }
        placeholder="Escrow ID"
        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
      />

      <input
        type="text"
        value={amount}
        onChange={(e) =>
          setAmount(
            e.target.value
          )
        }
        placeholder="ETH Amount"
        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
      />

      <div className="grid gap-3">
        <button
          onClick={handleCreate}
          disabled={loading}
          className="rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Create Escrow
        </button>

        <button
          onClick={handleFund}
          disabled={loading}
          className="rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-500 disabled:opacity-50"
        >
          Fund Escrow
        </button>

        <button
          onClick={handleRelease}
          disabled={loading}
          className="rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Release Payment
        </button>

        <button
          onClick={handleRefund}
          disabled={loading}
          className="rounded-lg bg-red-600 py-3 font-medium text-white hover:bg-red-500 disabled:opacity-50"
        >
          Refund Client
        </button>
      </div>

      {loading && (
        <p className="text-yellow-400">
          Waiting for blockchain confirmation...
        </p>
      )}

      {error && (
        <p className="text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}