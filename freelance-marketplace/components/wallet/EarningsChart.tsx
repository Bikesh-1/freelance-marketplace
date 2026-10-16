"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function EarningsChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Analytics</p>
          </div>
          <h2 className="text-lg font-bold text-neutral-950">Monthly Revenue</h2>
        </div>
        <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">ETH</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#737373", fontSize: 12 }} axisLine={{ stroke: "#d4d4d4" }} tickLine={false} />
          <YAxis tick={{ fill: "#737373", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e5e5", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} />
          <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }} activeDot={{ r: 6, fill: "#171717" }} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}