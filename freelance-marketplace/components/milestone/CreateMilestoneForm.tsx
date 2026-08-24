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

    if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
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
      className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6"
    >
      <div>
        <h2 className="text-xl font-semibold text-white">
          Add Milestone
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Create a milestone for this project.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Milestone Title
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Frontend Development"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Description
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what should be completed..."
          rows={4}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
        />
      </div>

      {/* Amount */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Amount (ETH)
        </label>

        <input
          type="number"
          min="0"
          step="0.001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.5"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
        />
      </div>

      {/* Due Date */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Due Date
        </label>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
        />
      </div>

      {/* Order */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Milestone Order
        </label>

        <input
          type="number"
          min="1"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Milestone"}
      </button>
    </form>
  );
}