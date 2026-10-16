"use client";

import { useSession } from "next-auth/react";
import Loginnavbar from "@/components/layout/loginNavbar";
import { useWallet, useWalletTransactions } from "@/hooks/useWallet";
import { useWalletSync } from "@/hooks/useWalletSync";
import WalletSummary from "@/components/wallet/WalletSummary";
import WalletActions from "@/components/wallet/WalletActions";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import EarningsChart from "@/components/wallet/EarningsChart";

export default function WalletPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "";
  const { data: wallet, isLoading } = useWallet(userId);
  const { data: transactions, isLoading: transactionsLoading } = useWalletTransactions(userId);
  const { address, balance } = useWalletSync();

  const earningsData = [
    { month: "Jan", revenue: 0.5 },
    { month: "Feb", revenue: 1.2 },
    { month: "Mar", revenue: 0.8 },
    { month: "Apr", revenue: 1.6 },
    { month: "May", revenue: 2.4 },
    { month: "Jun", revenue: 1.9 },
  ];

  if (isLoading || !wallet) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Loginnavbar />
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              <span className="text-sm font-medium text-neutral-600">Loading wallet...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Loginnavbar />

        <section className="mb-8 mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Finance & payments</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Wallet Dashboard</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Manage your wallet, monitor escrow funds, and track your payment activity.
            </p>
          </div>
          <WalletActions />
        </section>

        <section className="mb-8">
          <WalletSummary wallet={wallet} />
        </section>

        <section className="mb-8 overflow-hidden rounded-2xl bg-neutral-950 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-neutral-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-xl text-red-500">◇</span>
              <div>
                <h2 className="text-base font-semibold text-white">Connected Wallet</h2>
                <p className="mt-1 text-xs text-neutral-400">Wallet used for blockchain payments</p>
              </div>
            </div>
            <span className={`flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${address ? "bg-white/10 text-white" : "bg-red-500/10 text-red-300"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${address ? "bg-green-400" : "bg-red-500"}`} />
              {address ? "Connected" : "Not connected"}
            </span>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:p-6">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Wallet address</p>
              <p className="mt-3 break-all font-mono text-sm text-white">{address || "Connect MetaMask to see your wallet address"}</p>
            </div>
            <div className="flex min-w-[180px] flex-col justify-center rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">On-chain balance</p>
              <p className="mt-2 text-2xl font-bold text-white">{Number(balance || 0).toFixed(4)} <span className="text-sm font-medium text-neutral-400">ETH</span></p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <EarningsChart data={earningsData} />
          <TransactionHistory transactions={transactions || []} isLoading={transactionsLoading} />
        </div>
      </div>
    </main>
  );
}