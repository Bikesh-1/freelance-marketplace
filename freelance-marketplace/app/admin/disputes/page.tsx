"use client";

import { useEffect, useState } from "react";

import {
  getAdminDisputes,
  resolveDispute,
} from "@/services/dispute.service";

import { useEscrow } from "@/hooks/useEscrow";
type Dispute = {
  id: string;
  reason: string;
  evidence?: string | null;
  status:
  | "OPEN"
  | "UNDER_REVIEW"
  | "CLIENT_WON"
  | "FREELANCER_WON"
  | "RESOLVED"
  | "REJECTED";

  milestone: {
    id: string;
    title: string;
    amount: number;
    status: string;
    escrow?: {
      id: string;
      blockchainEscrowId: number | null;
    } | null;
  };
};

export default function AdminDisputesPage() {
  const [disputes, setDisputes] =
    useState<Dispute[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [resolving, setResolving] =
    useState<string | null>(null);

  const {
    adminReleasePayment,
    adminRefundClient,
  } = useEscrow();


  // -----------------------------------------
  // LOAD DISPUTES
  // -----------------------------------------

  useEffect(() => {
    let cancelled = false;

    const fetchDisputes = async () => {
      try {
        const data =
          await getAdminDisputes();

        if (!cancelled) {
          setDisputes(data);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Failed to load disputes:",
          error
        );

        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDisputes();

    return () => {
      cancelled = true;
    };
  }, []);

  // -----------------------------------------
  // RESOLVE DISPUTE
  // -----------------------------------------

  const handleResolve = async (
    dispute: Dispute,
    decision:
      | "CLIENT_WON"
      | "FREELANCER_WON"
  ) => {
    try {
      if (
        !dispute.milestone.escrow
      ) {
        throw new Error(
          "Escrow not found"
        );
      }

      const escrowIndex =
        dispute.milestone.escrow
          .blockchainEscrowId;

      if (
        escrowIndex === null ||
        escrowIndex === undefined
      ) {
        throw new Error(
          "Blockchain escrow ID not found"
        );
      }

      setResolving(dispute.id);

      // --------------------------------
      // CLIENT WINS → REFUND
      // --------------------------------

      if (
        decision === "CLIENT_WON"
      ) {
        await adminRefundClient(
          escrowIndex
        );
      }

      // --------------------------------
      // FREELANCER WINS → RELEASE
      // --------------------------------

      if (
        decision === "FREELANCER_WON"
      ) {
        await adminReleasePayment(
          escrowIndex
        );
      }

      // --------------------------------
      // Sync database
      // --------------------------------

      await resolveDispute(
        dispute.id,
        decision
      );

      alert(
        "Dispute resolved successfully"
      );

      setDisputes((current) =>
        current.map((item) =>
          item.id === dispute.id
            ? {
              ...item,
              status: "RESOLVED",
            }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Resolve dispute error:",
        error
      );

      alert(
        "Blockchain resolution failed. Database was not changed."
      );
    } finally {
      setResolving(null);
    }
  };

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <div className="p-8 text-white">
        Loading disputes...
      </div>
    );
  }

  // -----------------------------------------
  // PAGE
  // -----------------------------------------

  return (
    <div className="min-h-screen space-y-6 bg-slate-950 p-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Disputes
        </h1>

        <p className="mt-2 text-slate-400">
          Review and resolve milestone disputes.
        </p>
      </div>

      {/* No disputes */}

      {disputes.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-slate-400">
            No disputes found.
          </p>
        </div>
      )}

      {/* Disputes */}

      <div className="space-y-4">
        {disputes.map((dispute) => (
          <div
            key={dispute.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            {/* Header */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {dispute.milestone.title}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Milestone ID:{" "}
                  {dispute.milestone.id}
                </p>
              </div>

              <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                {dispute.status}
              </span>
            </div>

            {/* Amount */}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-slate-400">
                Amount
              </span>

              <span className="font-medium text-white">
                {dispute.milestone.amount} ETH
              </span>
            </div>

            {/* Reason */}

            <div className="mt-5">
              <p className="text-sm text-slate-400">
                Reason
              </p>

              <p className="mt-1 text-slate-200">
                {dispute.reason}
              </p>
            </div>

            {/* Evidence */}

            {dispute.evidence && (
              <div className="mt-4">
                <p className="text-sm text-slate-400">
                  Evidence
                </p>

                <a
                  href={dispute.evidence}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block break-all text-indigo-400 hover:underline"
                >
                  {dispute.evidence}
                </a>
              </div>
            )}

            {/* Actions */}

            {(dispute.status === "OPEN" ||
              dispute.status ===
              "UNDER_REVIEW") && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {/* Client wins */}

                  <button
                    onClick={() =>
                      handleResolve(
                        dispute,
                        "CLIENT_WON"
                      )
                    }
                    disabled={
                      resolving ===
                      dispute.id
                    }
                    className="flex-1 rounded-lg bg-yellow-600 py-3 font-medium text-white hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resolving ===
                      dispute.id
                      ? "Resolving..."
                      : "Refund Client"}
                  </button>

                  {/* Freelancer wins */}

                  <button
                    onClick={() =>
                      handleResolve(
                        dispute,
                        "FREELANCER_WON"
                      )
                    }
                    disabled={
                      resolving ===
                      dispute.id
                    }
                    className="flex-1 rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resolving === dispute.id ? "Resolving..."
                      : "Release to Freelancer"}
                  </button>
                </div>
              )}

            {dispute.status ==="RESOLVED" && (
                <div className="mt-5 rounded-lg border  border-green-700 bg-green-900/20 p-3 text-center text-green-400">
                  Dispute Resolved
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}