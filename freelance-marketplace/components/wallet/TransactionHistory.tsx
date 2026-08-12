"use client";

export default function TransactionHistory({
  transactions,
}: {
  transactions: any[];
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-5">
        <h2 className="text-xl font-semibold text-white">
          Recent Transactions
        </h2>
      </div>

      <div className="divide-y divide-slate-800">
        {transactions.map(
          (tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-5"
            >
              <div>
                <p className="font-medium text-white">
                  {tx.status}
                </p>

                <p className="text-sm text-slate-400">
                  {new Date(
                    tx.createdAt
                  ).toLocaleString()}
                </p>
              </div>

              <p className="text-lg font-semibold text-white">
                {tx.amount} ETH
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}