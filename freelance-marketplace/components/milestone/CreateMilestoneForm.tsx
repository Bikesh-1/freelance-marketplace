"use client";

import { useState } from "react";
import { createMilestone } from "@/services/milestone.service";

export default function CreateMilestoneForm({
  jobId,
}: {
  jobId: string;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [order, setOrder] = useState("1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    // Title validation
    if (!title.trim()) {
      setError("Milestone title is required");
      return;
    }

    // Amount validation
    const numericAmount = Number(amount);

    if (
      !amount ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError("Enter a valid amount");
      return;
    }

    // Order validation
    const numericOrder = Number(order);

    if (
      !order ||
      !Number.isInteger(numericOrder) ||
      numericOrder <= 0
    ) {
      setError("Enter a valid milestone order");
      return;
    }

    try {
      setLoading(true);

      await createMilestone(jobId, {
        title: title.trim(),
        description: description.trim() || undefined,
        amount: numericAmount,
        dueDate: dueDate || undefined,
        order: numericOrder,
      });

      alert("Milestone created successfully");

      setTitle("");
      setDescription("");
      setAmount("");
      setDueDate("");

      setOrder(String(numericOrder + 1));

      window.location.reload();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Failed to create milestone"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-neutral-100 px-5 py-5 sm:px-6">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-500">
            +
          </div>

          <div>

            <h2 className="text-sm font-semibold text-neutral-950">
              Add Milestone
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Create a clear payment stage for this project.
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          FORM BODY
      ===================================================== */}

      <div className="space-y-6 p-5 sm:p-6">

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
              !
            </div>

            <div>

              <p className="text-xs font-semibold text-red-700">
                Unable to create milestone
              </p>

              <p className="mt-1 text-xs leading-5 text-red-600">
                {error}
              </p>

            </div>

          </div>
        )}

        {/* =================================================
            TITLE
        ================================================= */}

        <div>

          <label
            htmlFor="milestone-title"
            className="mb-2 block text-xs font-semibold text-neutral-800"
          >
            Milestone Title
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            id="milestone-title"
            type="text"
            value={title}
            disabled={loading}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Development"
            className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="mt-2 text-[10px] text-neutral-400">
            Give this milestone a short and descriptive name.
          </p>

        </div>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <div>

          <div className="mb-2 flex items-center justify-between">

            <label
              htmlFor="milestone-description"
              className="text-xs font-semibold text-neutral-800"
            >
              Description
            </label>

            <span className="text-[10px] text-neutral-400">
              {description.length} characters
            </span>

          </div>

          <textarea
            id="milestone-description"
            value={description}
            disabled={loading}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            placeholder="Describe what should be completed..."
            rows={5}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="mt-2 text-[10px] text-neutral-400">
            Explain what needs to be delivered for this milestone.
          </p>

        </div>

        {/* =================================================
            AMOUNT + ORDER
        ================================================= */}

        <div className="grid gap-5 sm:grid-cols-2">

          {/* Amount */}

          <div>

            <label
              htmlFor="milestone-amount"
              className="mb-2 block text-xs font-semibold text-neutral-800"
            >
              Amount
              <span className="ml-1 text-red-500">*</span>
            </label>

            <div className="relative">

              <input
                id="milestone-amount"
                type="number"
                min="0"
                step="0.001"
                value={amount}
                disabled={loading}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="0.5"
                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 pr-16 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-neutral-500 shadow-sm ring-1 ring-neutral-100">
                ETH
              </span>

            </div>

            <p className="mt-2 text-[10px] text-neutral-400">
              Payment amount for this milestone.
            </p>

          </div>

          {/* Order */}

          <div>

            <label
              htmlFor="milestone-order"
              className="mb-2 block text-xs font-semibold text-neutral-800"
            >
              Milestone Order
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              id="milestone-order"
              type="number"
              min="1"
              value={order}
              disabled={loading}
              onChange={(e) =>
                setOrder(e.target.value)
              }
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-[10px] text-neutral-400">
              Determines the order of project milestones.
            </p>

          </div>

        </div>

        {/* =================================================
            DUE DATE
        ================================================= */}

        <div>

          <label
            htmlFor="milestone-due-date"
            className="mb-2 block text-xs font-semibold text-neutral-800"
          >
            Due Date
          </label>

          <input
            id="milestone-due-date"
            type="date"
            value={dueDate}
            disabled={loading}
            onChange={(e) =>
              setDueDate(e.target.value)
            }
            className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="mt-2 text-[10px] text-neutral-400">
            Set a target completion date for this milestone.
          </p>

        </div>

        {/* =================================================
            PREVIEW
        ================================================= */}

        <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-xs font-bold text-white">
              {order || "1"}
            </div>

            <div className="min-w-0 flex-1">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                <div>

                  <p className="text-sm font-semibold text-neutral-950">
                    {title || "Milestone Title"}
                  </p>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">
                    {description ||
                      "Milestone description will appear here."}
                  </p>

                </div>

                <span className="w-fit rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-neutral-600 shadow-sm ring-1 ring-neutral-100">
                  {amount || "0"} ETH
                </span>

              </div>

              <div className="mt-3 flex flex-wrap gap-2">

                <span className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-medium text-neutral-500">
                  Step {order || "1"}
                </span>

                {dueDate && (
                  <span className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-medium text-neutral-500">
                    Due {dueDate}
                  </span>
                )}

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            SUBMIT
        ================================================= */}

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creating...
            </>
          ) : (
            <>
              Create Milestone
              <span>→</span>
            </>
          )}
        </button>

        <p className="text-center text-[10px] leading-4 text-neutral-400">
          Once created, you can manage funding and milestone
          progress from this project.
        </p>

      </div>
    </form>
  );
}