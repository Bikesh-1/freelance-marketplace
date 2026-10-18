"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  unreadNotificationsCount: number;
};

const menuItems = [
  { href: "/freelancer/applications", label: "My applications", detail: "Track submitted proposals" },
  { href: "/message", label: "Messages", detail: "Continue client conversations" },
  { href: "/freelancer/experience", label: "Work experience", detail: "Manage your experience" },
  { href: "/freelancer/settings", label: "Skills & profile", detail: "Update your skills" },
  { href: "/notifications", label: "Notifications", detail: "See account updates" },
  { href: "/wallet", label: "Wallet", detail: "Manage payments and wallet" },
];

export default function FreelancerMoreMenu({ unreadNotificationsCount }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span>More</span>
        {unreadNotificationsCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadNotificationsCount}
          </span>
        )}
        <svg aria-hidden="true" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none">
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Your workspace</p>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
              >
                <span>
                  <span className="block text-sm font-semibold text-slate-800">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{item.detail}</span>
                </span>
                {item.href === "/notifications" && unreadNotificationsCount > 0 ? (
                  <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-600">{unreadNotificationsCount} new</span>
                ) : (
                  <span aria-hidden="true" className="text-slate-300">→</span>
                )}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
