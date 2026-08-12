"use client";

export default function ReviewAnalytics({
  analytics,
}: {
  analytics: any;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold text-white">
        Review Analytics
      </h2>

      <div className="mt-6 space-y-3">
        {[5, 4, 3, 2, 1].map(
          (star) => (
            <div
              key={star}
              className="flex items-center gap-3"
            >
              <span className="w-8 text-yellow-400">
                {star}★
              </span>

              <div className="h-2 flex-1 rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-yellow-400"
                  style={{
                    width: `${
                      analytics.totalReviews
                        ? (analytics
                            .distribution[
                            star
                          ] /
                            analytics.totalReviews) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <span className="text-slate-300">
                {
                  analytics
                    .distribution[
                    star
                  ]
                }
              </span>
            </div>
          )
        )}
      </div>

      <p className="mt-6 text-slate-400">
        Verified Reviews: {" "}
        <span className="text-white">
          {
            analytics.verifiedReviews
          }
        </span>
      </p>
    </div>
  );
}