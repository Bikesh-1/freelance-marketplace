"use client";

export default function WalletSummary({ wallet }: { wallet: any }) {
  const cards = [
    { title: "Available Balance", value: `${Number(wallet.walletBalance ?? 0).toFixed(4)} ETH`, accent: true },
    { title: "Escrow Balance", value: `${Number(wallet.escrowBalance ?? 0).toFixed(4)} ETH` },
    { title: "Total Earnings", value: `${Number(wallet.totalEarnings ?? 0).toFixed(4)} ETH` },
    { title: "Total Spent", value: `${Number(wallet.totalSpent ?? 0).toFixed(4)} ETH` },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">{card.title}</p>
            <span className={`h-2 w-2 rounded-full ${card.accent ? "bg-red-500" : "bg-neutral-300"}`} />
          </div>
          <h2 className={`text-2xl font-bold tracking-tight ${card.accent ? "text-red-600" : "text-neutral-950"}`}>{card.value}</h2>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-neutral-100">
            <div className={`h-full rounded-full ${card.accent ? "w-2/3 bg-red-500" : "w-1/3 bg-neutral-900"}`} />
          </div>
        </div>
      ))}
    </div>
  );
}