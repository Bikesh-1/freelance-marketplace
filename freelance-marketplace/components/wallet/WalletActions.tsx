"use client";

import { useRouter } from "next/navigation";

export default function WalletActions() {
  const router =
    useRouter();

  return (
    <div className="flex gap-4">
      <button
        onClick={() =>
          router.push(
            "/wallet/deposit"
          )
        }
        className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-500"
      >
        Deposit
      </button>

      <button
        onClick={() =>
          router.push(
            "/wallet/withdraw"
          )
        }
        className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500"
      >
        Withdraw
      </button>
    </div>
  );
}