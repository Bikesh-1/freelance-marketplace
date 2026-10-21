"use client";

import { useEffect, useState } from "react";
import { getAdminDisputes, resolveDispute } from "@/services/dispute.service";
import { useEscrow } from "@/hooks/useEscrow";

type Dispute = {
  id: string;
  reason: string;
  evidence?: string | null;
  status:
    | "OPEN"
    | "UNDER_REVIEW"
    | "CLIENT_WON"
    | "FREELANCER_WON"
    | "RESOLVED"
    | "REJECTED";
  milestone: {
    id: string;
    title: string;
    amount: number;
    status: string;
    escrow?: {
      id: string;
      blockchainEscrowId: number | null;
    } | null;
  };
};

const statusStyles: Record<Dispute["status"], string> = {
  OPEN: "border-amber-200 bg-amber-50 text-amber-700",
  UNDER_REVIEW: "border-blue-200 bg-blue-50 text-blue-700",
  CLIENT_WON: "border-emerald-200 bg-emerald-50 text-emerald-700",
  FREELANCER_WON: "border-emerald-200 bg-emerald-50 text-emerald-700",
  RESOLVED: "border-green-200 bg-green-50 text-green-700",
  REJECTED: "border-neutral-200 bg-neutral-100 text-neutral-600",
};

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [resolving, setResolving] = useState<string | null>(null);
  const { adminReleasePayment, adminRefundClient } = useEscrow();

  useEffect(() => {
    let cancelled = false;

    const fetchDisputes = async () => {
      try {
        const data = await getAdminDisputes();
        if (!cancelled) {
          setDisputes(data);
          setLoadError("");
        }
      } catch (error) {
        console.error("Failed to load disputes:", error);
        if (!cancelled) {
          setLoadError("We couldn't load disputes. Please refresh the page and try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDisputes();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleResolve = async (
    dispute: Dispute,
    decision: "CLIENT_WON" | "FREELANCER_WON"
  ) => {
    try {
      if (!dispute.milestone.escrow) throw new Error("Escrow not found");

      const escrowIndex = dispute.milestone.escrow.blockchainEscrowId;
      if (escrowIndex === null || escrowIndex === undefined) {
        throw new Error("Blockchain escrow ID not found");
      }

      setResolving(dispute.id);

      if (decision === "CLIENT_WON") await adminRefundClient(escrowIndex);
      if (decision === "FREELANCER_WON") await adminReleasePayment(escrowIndex);

      await resolveDispute(dispute.id, decision);

      setDisputes((current) =>
        current.map((item) =>
          item.id === dispute.id ? { ...item, status: "RESOLVED" } : item
        )
      );
      window.alert("Dispute resolved successfully");
    } catch (error) {
      console.error("Resolve dispute error:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Dispute resolution failed. Please verify the transaction and try again."
      );
    } finally {
      setResolving(null);
    }
  };

  const activeCount = disputes.filter(
    (dispute) => dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW"
  ).length;
  const resolvedCount = disputes.filter((dispute) => dispute.status === "RESOLVED").length;

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-950 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-3 w-32 rounded bg-neutral-200" />
          <div className="h-10 w-64 rounded-lg bg-neutral-200" />
          <div className="h-4 w-80 max-w-full rounded bg-neutral-200" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 rounded-2xl border border-neutral-200 bg-white" />
            ))}
          </div>
          <div className="h-64 rounded-2xl border border-neutral-200 bg-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-7 text-neutral-950 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-600">
              Administration / Trust &amp; Safety
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Dispute <span className="text-red-600">resolution</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
              Review milestone disputes, inspect evidence, and make a clear decision for each party.
            </p>
          </div>
          <a
            href="/admin"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-red-200 hover:text-red-600"
          >
            ← Admin overview
          </a>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">Total disputes</p>
            <p className="mt-2 text-3xl font-black tracking-tight">{disputes.length}</p>
            <p className="mt-1 text-xs text-neutral-500">All recorded cases</p>
          </article>
          <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-800">Awaiting decision</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-amber-900">{activeCount}</p>
            <p className="mt-1 text-xs text-amber-800">Open or under review</p>
          </article>
          <article className="rounded-2xl border border-green-200 bg-green-50/70 p-5 shadow-sm">
            <p className="text-sm font-medium text-green-800">Resolved</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-green-900">{resolvedCount}</p>
            <p className="mt-1 text-xs text-green-800">Cases marked resolved</p>
          </article>
        </section>

        {loadError && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {loadError}
          </div>
        )}

        {disputes.length === 0 && !loadError && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-2xl">✓</div>
            <h2 className="mt-4 text-lg font-bold">You&apos;re all caught up</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              There are no disputes to review right now. New cases will appear here when they are raised.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {disputes.map((dispute) => {
            const isActive = dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW";
            const isResolving = resolving === dispute.id;

            return (
              <article
                key={dispute.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 border-b border-neutral-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-neutral-100 px-2 py-1 font-mono text-[11px] font-semibold text-neutral-600">
                        CASE {dispute.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyles[dispute.status]}`}>
                        {dispute.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <h2 className="break-words text-lg font-bold tracking-tight sm:text-xl">
                      {dispute.milestone.title}
                    </h2>
                    <p className="mt-1 break-all text-xs text-neutral-500">
                      Milestone ID: <span className="font-mono">{dispute.milestone.id}</span>
                    </p>
                  </div>
                  <div className="shrink-0 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 sm:min-w-36">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Milestone value</p>
                    <p className="mt-1 text-xl font-black tracking-tight">{dispute.milestone.amount} ETH</p>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="space-y-5">
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Dispute reason</h3>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-800">
                        {dispute.reason || "No reason provided."}
                      </p>
                    </section>

                    {dispute.evidence && (
                      <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Submitted evidence</h3>
                        <a
                          href={dispute.evidence}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold text-red-600 underline decoration-red-200 underline-offset-4 transition hover:text-red-700"
                        >
                          <span className="break-all">{dispute.evidence}</span>
                          <span aria-hidden="true" className="shrink-0">↗</span>
                        </a>
                      </section>
                    )}
                  </div>

                  <aside className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Resolution actions</p>
                    {isActive ? (
                      <>
                        <p className="mt-2 text-sm leading-5 text-neutral-600">
                          Review the evidence before choosing an outcome. The selected action triggers an on-chain transaction.
                        </p>
                        <div className="mt-4 flex flex-col gap-2">
                          <button
                            onClick={() => handleResolve(dispute, "CLIENT_WON")}
                            disabled={Boolean(resolving)}
                            className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isResolving ? "Resolving…" : "Refund client"}
                          </button>
                          <button
                            onClick={() => handleResolve(dispute, "FREELANCER_WON")}
                            disabled={Boolean(resolving)}
                            className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-neutral-900 transition hover:border-neutral-950 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isResolving ? "Resolving…" : "Release to freelancer"}
                          </button>
                        </div>
                        <p className="mt-3 text-[11px] leading-4 text-neutral-500">
                          Confirm the dispute details before submitting. Blockchain actions may be irreversible.
                        </p>
                      </>
                    ) : (
                      <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3">
                        <p className="text-sm font-bold text-green-800">Resolution recorded</p>
                        <p className="mt-1 text-xs leading-5 text-green-700">
                          This case is no longer awaiting an admin decision.
                        </p>
                      </div>
                    )}
                  </aside>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
