"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F4EE] px-5 py-16 text-[#111]">
      <section className="w-full max-w-lg text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-500">Freelanzo</p>
        <h1 className="mt-5 text-3xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">The page could not be loaded. Please try again, or return home if the problem continues.</p>
        {error.digest && <p className="mt-3 text-xs text-neutral-500">Reference: {error.digest}</p>}
        <div className="mt-7 flex justify-center gap-3">
          <button onClick={() => reset()} className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-red-500">Try again</button>
          <Link href="/" className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold">Go home</Link>
        </div>
      </section>
    </main>
  );
}
