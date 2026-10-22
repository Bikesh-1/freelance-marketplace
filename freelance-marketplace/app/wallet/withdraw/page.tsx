"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import Loginnavbar from "@/components/layout/loginNavbar";
import { useWallet } from "@/hooks/useWallet";

export default function WithdrawPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const userId = session?.user?.id || "";
  const { data: wallet, isLoading } = useWallet(userId);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/wallet/withdraw", {
        amount: Number(amount),
        txHash: txHash.trim(),
      });
      return response.data;
    },
    onSuccess: async () => {
      setMessageType("success");
      setMessage("Withdrawal verified and recorded successfully.");
      toast.success("Withdrawal successful", { description: "Your withdrawal was verified and recorded." });
      setAmount("");
      setTxHash("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wallet", userId] }),
        queryClient.invalidateQueries({ queryKey: ["wallet-transactions", userId] }),
      ]);
    },
    onError: (error: unknown) => {
      const responseMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : null;
      setMessageType("error");
      setMessage(responseMessage || (error instanceof Error ? error.message : "Withdrawal could not be verified."));
      toast.error("Withdrawal failed", { description: responseMessage || (error instanceof Error ? error.message : "Withdrawal could not be verified.") });
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setMessageType("error");
      setMessage("Enter a valid withdrawal amount greater than zero.");
      toast.error("Invalid withdrawal amount");
      return;
    }
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash.trim())) {
      setMessageType("error");
      setMessage("Enter the transaction hash for the completed payout.");
      toast.error("Invalid transaction hash", { description: "Enter the hash for the completed payout." });
      return;
    }
    if (Number(amount) > Number(wallet?.walletBalance ?? 0)) {
      setMessageType("error");
      setMessage("The amount is greater than your available wallet balance.");
      toast.error("Insufficient balance");
      return;
    }
    withdrawMutation.mutate();
  }

  if (status === "loading") {
    return <main className="min-h-screen bg-[#f7f7f8] text-neutral-900"><div className="mx-auto max-w-5xl px-4"><Loginnavbar /><p className="py-20 text-center text-neutral-500">Loading account...</p></div></main>;
  }

  if (!session?.user?.id) {
    return <main className="min-h-screen bg-[#f7f7f8] text-neutral-900"><div className="mx-auto max-w-5xl px-4"><Loginnavbar /><section className="mx-auto mt-12 max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-bold">Sign in to withdraw</h1><p className="mt-2 text-sm text-neutral-500">You need to sign in to access your wallet.</p><button onClick={() => router.push("/login")} className="mt-6 rounded-xl bg-neutral-950 px-5 py-3 font-semibold text-white hover:bg-neutral-800">Sign in</button></section></div></main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">
      <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <Loginnavbar />
        <button onClick={() => router.push("/wallet")} className="mt-5 text-sm font-semibold text-neutral-600 transition hover:text-red-600">← Back to wallet</button>
        <section className="mx-auto mt-5 max-w-2xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="bg-neutral-950 px-6 py-7 text-white sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">Wallet · Payout</p>
            <h1 className="mt-2 text-3xl font-bold">Withdraw funds</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-300">Verify a completed payout to your connected wallet.</p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="mb-6 rounded-xl border border-neutral-200 bg-[#f7f7f8] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Available wallet balance</p>
              <p className="mt-1 text-2xl font-bold text-neutral-950">{isLoading ? "Loading..." : Number(wallet?.walletBalance ?? 0).toFixed(4)} <span className="text-sm font-medium text-neutral-500">ETH</span></p>
            </div>
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <strong>Important:</strong> this form does not send ETH by itself. Your payout must already have been sent on-chain by the configured platform withdrawal wallet. Then enter that transaction hash below. If the platform payout wallet is not configured on the server, ask the site administrator to configure <code>WALLET_WITHDRAWAL_ADDRESS</code> and the payout process.
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="amount" className="mb-2 block text-sm font-semibold text-neutral-800">Amount (ETH)</label>
                <input id="amount" type="number" min="0.000001" max={Number(wallet?.walletBalance ?? 0)} step="any" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.01" required className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label htmlFor="txHash" className="mb-2 block text-sm font-semibold text-neutral-800">Completed payout transaction hash</label>
                <input id="txHash" type="text" value={txHash} onChange={(event) => setTxHash(event.target.value)} placeholder="0x..." required spellCheck={false} autoComplete="off" className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                <p className="mt-2 text-xs leading-5 text-neutral-500">The server checks the chain transaction, sender, recipient and amount before updating your wallet.</p>
              </div>
              {message && <p role="status" className={`rounded-xl border px-4 py-3 text-sm ${messageType === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>{message}</p>}
              <button type="submit" disabled={withdrawMutation.isPending || isLoading} className="w-full rounded-xl bg-red-500 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60">{withdrawMutation.isPending ? "Verifying transaction..." : "Verify withdrawal"}</button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
