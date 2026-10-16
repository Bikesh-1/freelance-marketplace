"use client";

import { useRouter } from "next/navigation";

export default function WalletActions() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-3">
      <button onClick={() => router.push("/wallet/deposit")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
        <span className="text-lg leading-none">＋</span> Deposit
      </button>
      <button onClick={() => router.push("/wallet/withdraw")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2">
        <span className="text-lg leading-none">↗</span> Withdraw
      </button>
    </div>
  );
}