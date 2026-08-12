"use client";

export default function ReviewCard({
  review,
}: {
  review: any;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-white">
            {
              review.client
                ?.companyName ||
              "Client"
            }
          </h4>

          <p className="text-sm text-slate-400">
            {
              review.client
                ?.user
                ?.name
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-yellow-400">
            {"★".repeat(
              review.rating
            )}
          </div>
          {review.isVerified && (
            <span className="rounded-full bg-green-600 px-2 py-1 text-xs text-white">
              Verified
            </span>
          )}
        </div>
        {review.reply && (
          <div className="mt-4 rounded-xl bg-slate-800 p-4">
            <p className="text-sm font-medium text-white">
              Freelancer Reply
            </p>

            <p className="mt-2 text-slate-300">
              {review.reply}
            </p>
          </div>
        )}

      </div>

      <p className="mt-4 text-slate-300">
        {review.comment}
      </p>

      <p className="mt-4 text-xs text-slate-500">
        {new Date(
          review.createdAt
        ).toLocaleDateString()}
      </p>
    </div>
  );
}