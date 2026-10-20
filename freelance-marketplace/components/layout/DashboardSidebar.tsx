"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  MessageCircle,
  Wallet,
  Bell,
  UserRound,
  Settings,
  Sparkles,
  X,
  Menu,
  PlusCircle,
  Clock3,
  LifeBuoy,
  ChevronRight,
} from "lucide-react";

type DashboardSidebarProps = {
  role: "CLIENT" | "FREELANCER";
};

const clientLinks = [
  { label: "Overview", href: "/client/dashboard", icon: LayoutDashboard },
  { label: "My Jobs", href: "/client/jobs", icon: BriefcaseBusiness },
  { label: "Post a Job", href: "/client/jobs/create", icon: PlusCircle },
  { label: "Messages", href: "/message", icon: MessageCircle },
  { label: "Wallet & Escrow", href: "/wallet", icon: Wallet },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Company Profile", href: "/client/profile", icon: UserRound },
];

const freelancerLinks = [
  { label: "Overview", href: "/freelancer/dashboard", icon: LayoutDashboard },
  { label: "Find Jobs", href: "/jobs", icon: BriefcaseBusiness },
  { label: "AI Recommendations", href: "/freelancer/recommendations", icon: Sparkles },
  { label: "Applications", href: "/freelancer/applications", icon: FileText },
  { label: "Experience", href: "/freelancer/experience", icon: Clock3 },
  { label: "Messages", href: "/message", icon: MessageCircle },
  { label: "Wallet & Escrow", href: "/wallet", icon: Wallet },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile & Skills", href: "/freelancer/settings", icon: Settings },
];

export default function DashboardSidebar({ role }: DashboardSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const links = role === "CLIENT" ? clientLinks : freelancerLinks;
  const workspace = role === "CLIENT" ? "Client workspace" : "Freelancer workspace";
  const dashboardHref = role === "CLIENT" ? "/client/dashboard" : "/freelancer/dashboard";

  const sidebar = (
    <aside className="flex h-full w-[272px] flex-col border-r border-slate-200/80 bg-white px-4 py-5 shadow-[0_8px_32px_rgba(15,23,42,0.03)]">
      <Link href={dashboardHref} className="mb-8 flex items-center gap-3 rounded-2xl px-3 py-2 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-rose-500">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white shadow-sm shadow-red-500/20">
          <span className="text-lg font-black">F</span>
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-extrabold tracking-tight text-slate-950">Freelanzo</span>
          <span className="mt-0.5 block text-[11px] font-medium text-slate-500">{workspace}</span>
        </span>
      </Link>

      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
      <nav aria-label={workspace} className="flex-1 space-y-1">
        {links.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/client/dashboard" &&
              href !== "/freelancer/dashboard" &&
              pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                active
                  ? "bg-rose-50 text-rose-600 shadow-sm shadow-rose-950/[0.02]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              {active && <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-red-500" />}
              <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${active ? "text-red-500" : "text-slate-400 group-hover:text-slate-700"}`} strokeWidth={1.8} />
              <span className="min-w-0 flex-1">{label}</span>
              {active && <ChevronRight className="h-4 w-4 text-rose-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm">
          <LifeBuoy className="h-[18px] w-[18px]" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Need a hand?</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Get help with your projects, payments or account.</p>
        <Link
          href="/contact"
          onClick={() => setMobileOpen(false)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-600 transition hover:text-rose-700"
        >
          Contact support <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      <div className="fixed left-4 top-[5.25rem] z-40 lg:hidden">
        <button
          type="button"
          aria-label={mobileOpen ? "Close dashboard menu" : "Open dashboard menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-md transition hover:border-rose-200 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="fixed bottom-0 left-0 top-20 z-30 hidden lg:block">
        {sidebar}
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close dashboard menu overlay"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
          />
          <div className="fixed bottom-0 left-0 top-20 z-50 lg:hidden">
            {sidebar}
          </div>
        </>
      )}
    </>
  );
}
