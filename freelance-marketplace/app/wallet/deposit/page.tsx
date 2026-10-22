"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import axios from "axios";
import { toast } from "sonner";
import Loginnavbar from "@/components/layout/loginNavbar";
import { useWallet } from "@/hooks/useWallet";
import { getBrowserProvider, getConfiguredChainId } from "@/lib/blockchain/provider";

export default function DepositPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const userId = session?.user?.id || "";
  const { data: wallet, isLoading } = useWallet(userId);
  const [amount, setAmount] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  useEffect(() => {
    if (!userId) return;
    axios.get("/api/wallet/deposit")
      .then((response) => setDepositAddress(response.data.depositAddress || ""))
      .catch((error: unknown) => {
        const text = axios.isAxiosError(error) ? error.response?.data?.message : null;
        setMessageType("error");
        setMessage(text || "Could not load the deposit destination. Check server configuration.");
      });
  }, [userId]);

  const depositMutation = useMutation({
    mutationFn: async () => {
      if (!depositAddress) throw new Error("Deposit wallet is not configured on the server.");
      if (!window.ethereum) throw new Error("MetaMask is not installed. Install or enable MetaMask first.");
      const provider = getBrowserProvider();
      const network = await provider.getNetwork();
      const expectedChainId = getConfiguredChainId();
      if (network.chainId !== expectedChainId) {
        throw new Error("Wrong network in MetaMask. Switch to the configured network and try again.");
      }
      const signer = await provider.getSigner();
      const sender = await signer.getAddress();
      await axios.post("/api/wallet/connect", { walletAddress: sender });
      const tx = await signer.sendTransaction({
        to: depositAddress,
        value: ethers.parseEther(amount),
      });
      setMessageType("success");
      setMessage("Transaction sent. Waiting for blockchain confirmation...");
      await tx.wait();
      await axios.post("/api/wallet/deposit", { amount: Number(amount), txHash: tx.hash });
      return tx.hash;
    },
    onSuccess: async (hash) => {
      setMessageType("success");
      setMessage("Deposit confirmed and added to your wallet. Transaction: " + hash);
      toast.success("Deposit successful", { description: "Your wallet has been updated." });
      setAmount("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wallet", userId] }),
        queryClient.invalidateQueries({ queryKey: ["wallet-transactions", userId] }),
      ]);
    },
    onError: (error: unknown) => {
      const text = axios.isAxiosError(error) ? error.response?.data?.message : null;
      setMessageType("error");
      setMessage(text || (error instanceof Error ? error.message : "Deposit failed. Please try again."));
      toast.error("Deposit failed", { description: text || (error instanceof Error ? error.message : "Please try again.") });
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setMessageType("error");
      setMessage("Enter a valid ETH amount greater than zero.");
      toast.error("Invalid amount", { description: "Enter an ETH amount greater than zero." });
      return;
    }
    if (Number(amount) > 1000000) {
      setMessageType("error");
      setMessage("Amount is too large.");
      toast.error("Amount is too large");
      return;
    }
    depositMutation.mutate();
  }

  if (status === "loading") {
    return <main className="min-h-screen bg-[#f7f7f8] text-neutral-900"><div className="mx-auto max-w-5xl px-4"><Loginnavbar /><p className="py-20 text-center text-neutral-500">Loading account...</p></div></main>;
  }

  if (!session?.user?.id) {
    return <main className="min-h-screen bg-[#f7f7f8] text-neutral-900"><div className="mx-auto max-w-5xl px-4"><Loginnavbar /><section className="mx-auto mt-12 max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-bold">Sign in to deposit</h1><p className="mt-2 text-sm text-neutral-500">You need to sign in to access your wallet.</p><button onClick={() => router.push("/login")} className="mt-6 rounded-xl bg-neutral-950 px-5 py-3 font-semibold text-white hover:bg-neutral-800">Sign in</button></section></div></main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">
      <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <Loginnavbar />
        <button onClick={() => router.push("/wallet")} className="mt-5 text-sm font-semibold text-neutral-600 transition hover:text-red-600">← Back to wallet</button>
        <section className="mx-auto mt-5 max-w-2xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="bg-neutral-950 px-6 py-7 text-white sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">Wallet · Add funds</p>
            <h1 className="mt-2 text-3xl font-bold">Deposit ETH</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-300">Send ETH from your connected MetaMask wallet and verify it on-chain.</p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="mb-6 rounded-xl border border-neutral-200 bg-[#f7f7f8] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Current platform wallet balance</p>
              <p className="mt-1 text-2xl font-bold text-neutral-950">{isLoading ? "Loading..." : Number(wallet?.walletBalance ?? 0).toFixed(4)} <span className="text-sm font-medium text-neutral-500">ETH</span></p>
            </div>
            {depositAddress ? <div className="mb-6 rounded-xl border border-neutral-200 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Deposit destination</p><p className="mt-2 break-all font-mono text-sm text-neutral-900">{depositAddress}</p><p className="mt-2 text-xs text-neutral-500">Check the address and network before confirming the transaction in MetaMask.</p></div> : <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Loading deposit destination. If this message remains, the server may not have WALLET_DEPOSIT_ADDRESS configured.</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="amount" className="mb-2 block text-sm font-semibold text-neutral-800">Amount (ETH)</label>
                <input id="amount" type="number" min="0.000001" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.01" required className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                <p className="mt-2 text-xs text-neutral-500">MetaMask will show the transaction and gas fee before you approve it.</p>
              </div>
              {message && <p role="status" className={`break-words rounded-xl border px-4 py-3 text-sm ${messageType === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>{message}</p>}
              <button type="submit" disabled={depositMutation.isPending || isLoading || !depositAddress} className="w-full rounded-xl bg-red-500 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60">{depositMutation.isPending ? "Processing deposit..." : "Deposit with MetaMask"}</button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
