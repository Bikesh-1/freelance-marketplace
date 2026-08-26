"use client";

import { useEffect, useState } from "react";

import {
  getEscrowTransactions,
} from "@/services/escrow.service";

type Transaction = {
  id: string;

  type:
    | "CREATED"
    | "FUNDED"
    | "RELEASED"
    | "REFUNDED";

  transactionHash: string;

  amount?: number | null;

  fromAddress?: string | null;

  toAddress?: string | null;

  network: string;

  createdAt: string;
};

export default function TransactionHistory({
  escrowId,
}: {
  escrowId: string;
}) {
  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadTransactions = async () => {
      try {
        const data =
          await getEscrowTransactions(
            escrowId
          );

        if (!cancelled) {
          setTransactions(data);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Failed to load transactions:",
          error
        );

        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [escrowId]);

  {/* =====================================================
      LOADING
  ===================================================== */}

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5">

        <div className="flex items-center gap-3">

          <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-red-500" />

          <div>
            <p className="text-sm font-medium text-neutral-700">
              Loading transaction history...
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              Fetching the latest escrow activity.
            </p>
          </div>

        </div>

      </div>
    );
  }

  {/* =====================================================
      EMPTY STATE
  ===================================================== */}

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-6 text-center">

        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          —
        </div>

        <p className="mt-3 text-sm font-medium text-neutral-700">
          No transactions found
        </p>

        <p className="mt-1 text-xs text-neutral-400">
          Escrow transactions will appear here once activity
          occurs.
        </p>

      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between">

        <div>

          <div className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-red-500" />

            <h3 className="text-sm font-semibold text-neutral-950">
              Transaction History
            </h3>

          </div>

          <p className="mt-1 text-xs text-neutral-500">
            Blockchain activity for this escrow.
          </p>

        </div>

        <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          {transactions.length}{" "}
          {transactions.length === 1
            ? "Transaction"
            : "Transactions"}
        </span>

      </div>

      {/* =====================================================
          TRANSACTIONS
      ===================================================== */}

      <div className="space-y-3">

        {transactions.map((transaction) => (

          <div
            key={transaction.id}
            className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm"
          >

            {/* Top Row */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    transaction.type === "RELEASED"
                      ? "bg-green-50 text-green-600"
                      : transaction.type === "REFUNDED"
                        ? "bg-amber-50 text-amber-600"
                        : transaction.type === "FUNDED"
                          ? "bg-red-50 text-red-500"
                          : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {transaction.type === "RELEASED"
                    ? "✓"
                    : transaction.type === "REFUNDED"
                      ? "↩"
                      : transaction.type === "FUNDED"
                        ? "$"
                        : "•"}
                </div>

                <div>

                  <span className="text-sm font-semibold text-neutral-950">
                    {transaction.type}
                  </span>

                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-400">
                    Escrow Transaction
                  </p>

                </div>

              </div>

              {transaction.amount !== null &&
                transaction.amount !== undefined && (
                  <span className="w-fit rounded-full bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-800">
                    {transaction.amount} ETH
                  </span>
                )}

            </div>

            {/* Transaction Hash */}

            <div className="mt-4 rounded-lg border border-neutral-100 bg-neutral-50 p-3">

              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Transaction Hash
              </p>

              <p className="break-all font-mono text-[11px] leading-5 text-red-500">
                {transaction.transactionHash}
              </p>

            </div>

            {/* Metadata */}

            <div className="mt-3 flex flex-col gap-2 border-t border-neutral-100 pt-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2">

                <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-medium text-neutral-500">
                  {transaction.network}
                </span>

              </div>

              <p className="text-[10px] text-neutral-400">
                {new Date(
                  transaction.createdAt
                ).toLocaleString()}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}