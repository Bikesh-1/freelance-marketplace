"use client"

import { useWallet } from "@/hooks/useWallet"

export default function ConnectWalletButton() {
  const {
    walletAddress,
    loading,
    connect,
    disconnect,
  } = useWallet()

  if (walletAddress) {
    return (
      <button
        onClick={disconnect}
        className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-500"
      >
        {walletAddress.slice(0, 6)}
        ...
        {walletAddress.slice(-4)}
      </button>
    )
  }

  return (
    <button
      onClick={connect}
      disabled={loading}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 disabled:opacity-50"
    >
      {loading
        ? "Connecting..."
        : "Connect Wallet"}
    </button>
  )
}