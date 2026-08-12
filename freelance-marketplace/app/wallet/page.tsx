"use client";

import { useSession } from "next-auth/react";

import {
  useWallet,
  useWalletTransactions,
} from "@/hooks/useWallet";

import { useWalletSync } from "@/hooks/useWalletSync";

import WalletSummary from "@/components/wallet/WalletSummary";
import WalletActions from "@/components/wallet/WalletActions";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import EarningsChart from "@/components/wallet/EarningsChart";

export default function WalletPage() {
  const { data: session } = useSession();

  const userId = session?.user?.id || "";

  const {
    data: wallet,
    isLoading,
  } = useWallet(userId);

  const {
    data: transactions,
  } =
    useWalletTransactions(userId);

  const {
    address,
    balance,
  } = useWalletSync();

  // Temporary demo analytics data
  // Later we will fetch from /api/wallet/analytics/earnings
  const earningsData = [
    {
      month: "Jan",
      revenue: 0.5,
    },
    {
      month: "Feb",
      revenue: 1.2,
    },
    {
      month: "Mar",
      revenue: 0.8,
    },
    {
      month: "Apr",
      revenue: 1.6,
    },
    {
      month: "May",
      revenue: 2.4,
    },
    {
      month: "Jun",
      revenue: 1.9,
    },
  ];

  if (
    isLoading ||
    !wallet
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading wallet...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Wallet Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              Manage your wallet,
              escrow balance, and
              earnings
            </p>
          </div>

          <WalletActions />
        </div>

        {/* Summary Cards */}
        <WalletSummary
          wallet={wallet}
        />

        {/* Connected Wallet */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">
            Connected Wallet
          </h2>

          <p className="mt-4 break-all text-slate-300">
            {address ||
              "Wallet not connected"}
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {Number(
              balance
            ).toFixed(4)} ETH
          </p>
        </div>

        {/* Earnings Analytics */}
        <EarningsChart
          data={earningsData}
        />

        {/* Transaction History */}
        <TransactionHistory
          transactions={
            transactions || []
          }
        />
      </div>
    </main>
  );
}