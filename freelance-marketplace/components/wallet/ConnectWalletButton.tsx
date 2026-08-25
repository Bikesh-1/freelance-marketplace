"use client";

import { useWalletConnection } from "@/hooks/useWallet";

export default function ConnectWalletButton() {
  const {
    walletAddress,
    loading,
    error,
    connect,
    disconnect,
  } = useWalletConnection();

  if (walletAddress) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={disconnect}
          disabled={loading}
          className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 font-medium text-green-400 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Disconnecting..."
            : `${walletAddress.slice(
                0,
                6
              )}...${walletAddress.slice(-4)}`}
        </button>

        {error && (
          <p className="text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={connect}
        disabled={loading}
        className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Connecting..."
          : "Connect Wallet"}
      </button>

      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}