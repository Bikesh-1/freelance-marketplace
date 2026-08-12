"use client";

export default function WalletSummary({
  wallet,
}: {
  wallet: any;
}) {
  const cards = [
    {
      title:
        "Available Balance",
      value: `${wallet.walletBalance.toFixed(
        2
      )} ETH`,
    },

    {
      title:
        "Escrow Balance",
      value: `${wallet.escrowBalance.toFixed(
        2
      )} ETH`,
    },

    {
      title:
        "Total Earnings",
      value: `${wallet.totalEarnings.toFixed(
        2
      )} ETH`,
    },

    {
      title: "Total Spent",
      value: `${wallet.totalSpent.toFixed(
        2
      )} ETH`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(
        (card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <p className="text-sm text-slate-400">
              {card.title}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-white">
              {card.value}
            </h2>
          </div>
        )
      )}
    </div>
  );
}