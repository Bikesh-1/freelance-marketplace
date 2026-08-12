"use client";

import { useState } from "react";

import StarRating from "./StarRating";
import { useCreateReview } from "@/hooks/useReviews";

export default function ReviewForm({
  clientId,
  freelancerId,
}: {
  clientId: string;
  freelancerId: string;
}) {
  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState("");

  const mutation =
    useCreateReview();

  const submit =
    async () => {
      await mutation.mutateAsync({
        clientId,
        freelancerId,
        rating,
        comment,
      });

      alert(
        "Review submitted successfully"
      );

      setComment("");
      setRating(5);
    };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-xl font-semibold text-white">
        Leave a Review
      </h3>

      <StarRating
        value={rating}
        onChange={setRating}
      />

      <textarea
        value={comment}
        onChange={(e) =>
          setComment(
            e.target.value
          )
        }
        placeholder="Write your experience..."
        className="h-32 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white placeholder:text-slate-500"
      />

      <button
        onClick={submit}
        disabled={
          mutation.isPending
        }
        className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {mutation.isPending
          ? "Submitting..."
          : "Submit Review"}
      </button>
    </div>
  );
}