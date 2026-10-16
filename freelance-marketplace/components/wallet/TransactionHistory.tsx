"use client";

export default function TransactionHistory({ transactions, isLoading = false }: { transactions: any[]; isLoading?: boolean }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-5 sm:px-6">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Wallet activity</p>
          </div>
          <h2 className="text-lg font-bold text-neutral-950">Recent Transactions</h2>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">{transactions.length} records</span>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-sm text-neutral-500">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl text-red-500">↗</div>
          <p className="text-sm font-semibold text-neutral-800">No transactions yet</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-neutral-500">Your wallet activity will appear here when a transaction is recorded.</p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-neutral-50 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${String(tx.type ?? "").toUpperCase() === "EARNING" ? "bg-red-50 text-red-600" : "bg-neutral-100 text-neutral-700"}`}>
                  {String(tx.type ?? "").toUpperCase() === "EARNING" ? "↙" : "↗"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900">{tx.type ?? tx.status ?? "TRANSACTION"}</p>
                  <p className="mt-1 text-xs text-neutral-500">{new Date(tx.createdAt).toLocaleString()}</p>
                  {tx.txHash && <p className="mt-1 max-w-[180px] truncate font-mono text-[10px] text-neutral-400">{tx.txHash}</p>}
                </div>
              </div>
              <p className="shrink-0 text-sm font-bold text-neutral-950">{Number(tx.amount ?? 0).toFixed(4)} <span className="text-xs font-medium text-neutral-500">ETH</span></p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}