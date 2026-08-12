"use client";

export default function ReputationHeader({
  averageRating,
  totalReviews,
}: {
  averageRating: number;
  totalReviews: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-2xl font-bold text-white">
        Reputation
      </h2>

      <div className="mt-4 flex items-center gap-4">
        <div className="text-5xl font-bold text-yellow-400">
          {averageRating.toFixed(
            1
          )}
        </div>

        <div>
          <p className="text-lg text-white">
            {"★".repeat(
              Math.round(
                averageRating
              )
            )}
          </p>

          <p className="text-slate-400">
            {totalReviews} reviews
          </p>
        </div>
      </div>
    </div>
  );
}