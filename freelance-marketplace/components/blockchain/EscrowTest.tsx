"use client";

import { useState } from "react";

import { useEscrow } from "@/hooks/useEscrow";

export default function EscrowTest() {
  const {
    createEscrow,
    fundEscrow,
    releasePayment,
    refundPayment,
    loading,
    error,
  } = useEscrow();

  const [freelancerAddress, setFreelancerAddress] =
    useState("");

  const [escrowId, setEscrowId] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const handleCreate = async () => {
    if (!freelancerAddress) {
      alert("Enter freelancer wallet");
      return;
    }

    const receipt =
      await createEscrow(
        freelancerAddress
      );

    console.log(
      "Create transaction:",
      receipt
    );

    alert(
      "Escrow created successfully"
    );
  };

  const handleFund = async () => {
    if (!escrowId || !amount) {
      alert(
        "Enter escrow ID and amount"
      );
      return;
    }

    const receipt =
      await fundEscrow(
        Number(escrowId),
        amount
      );

    console.log(
      "Fund transaction:",
      receipt
    );

    alert(
      "Escrow funded successfully"
    );
  };

  const handleRelease = async () => {
    if (!escrowId) {
      alert("Enter escrow ID");
      return;
    }

    await releasePayment(
      Number(escrowId)
    );

    alert(
      "Payment released successfully"
    );
  };

  const handleRefund = async () => {
    if (!escrowId) {
      alert("Enter escrow ID");
      return;
    }

    await refundPayment(
      Number(escrowId)
    );

    alert(
      "Payment refunded successfully"
    );
  };

  return (
    <div className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">

      <h2 className="text-2xl font-bold text-white">
        Escrow Test
      </h2>

      <input
        type="text"
        placeholder="Freelancer wallet address"
        value={freelancerAddress}
        onChange={(e) =>
          setFreelancerAddress(
            e.target.value
          )
        }
        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
      />

      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-3 text-white"
      >
        Create Escrow
      </button>

      <input
        type="number"
        placeholder="Escrow ID"
        value={escrowId}
        onChange={(e) =>
          setEscrowId(
            e.target.value
          )
        }
        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
      />

      <input
        type="text"
        placeholder="ETH amount"
        value={amount}
        onChange={(e) =>
          setAmount(
            e.target.value
          )
        }
        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
      />

      <button
        onClick={handleFund}
        disabled={loading}
        className="w-full rounded-lg bg-green-600 py-3 text-white"
      >
        Fund Escrow
      </button>

      <button
        onClick={handleRelease}
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-3 text-white"
      >
        Release Payment
      </button>

      <button
        onClick={handleRefund}
        disabled={loading}
        className="w-full rounded-lg bg-red-600 py-3 text-white"
      >
        Refund Payment
      </button>

      {loading && (
        <p className="text-yellow-400">
          Waiting for transaction...
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