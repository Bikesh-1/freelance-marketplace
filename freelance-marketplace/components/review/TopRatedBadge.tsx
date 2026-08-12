"use client";

export default function TopRatedBadge({
  show,
}: {
  show: boolean;
}) {
  if (!show) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-yellow-500 px-3 py-1 text-sm font-semibold text-slate-900">
      ★ Top Rated
    </span>
  );
}