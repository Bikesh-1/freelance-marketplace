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

    const loadTransactions =
      async () => {
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

  if (loading) {
    return (
      <div className="text-sm text-slate-400">
        Loading transaction history...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 p-4 text-sm text-slate-400">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">
        Transaction History
      </h3>

      {transactions.map(
        (transaction) => (
          <div
            key={transaction.id}
            className="rounded-xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">
                {transaction.type}
              </span>

              {transaction.amount !==
                null &&
                transaction.amount !==
                  undefined && (
                  <span className="text-slate-300">
                    {transaction.amount} ETH
                  </span>
                )}
            </div>

            <p className="mt-2 break-all text-sm text-indigo-400">
              {transaction.transactionHash}
            </p>

            <div className="mt-2 text-xs text-slate-500">
              {transaction.network}
            </div>

            <div className="mt-1 text-xs text-slate-500">
              {new Date(
                transaction.createdAt
              ).toLocaleString()}
            </div>
          </div>
        )
      )}
    </div>
  );
}