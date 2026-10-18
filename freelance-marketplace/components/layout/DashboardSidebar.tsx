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
} from "lucide-react";

type DashboardSidebarProps = {
  role: "CLIENT" | "FREELANCER";
};

const clientLinks = [
  { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { label: "My Jobs", href: "/client/jobs", icon: BriefcaseBusiness },
  { label: "Post a Job", href: "/client/jobs/create", icon: PlusCircle },
  { label: "Messages", href: "/message", icon: MessageCircle },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/client/profile", icon: UserRound },
];

const freelancerLinks = [
  { label: "Dashboard", href: "/freelancer/dashboard", icon: LayoutDashboard },
  { label: "Find Jobs", href: "/jobs", icon: BriefcaseBusiness },
  { label: "Recommended Jobs", href: "/freelancer/recommendations", icon: Sparkles },
  { label: "Applications", href: "/freelancer/applications", icon: FileText },
  { label: "Experience", href: "/freelancer/experience", icon: Clock3 },
  { label: "Messages", href: "/message", icon: MessageCircle },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile & Skills", href: "/freelancer/settings", icon: Settings },
];

export default function DashboardSidebar({ role }: DashboardSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const links = role === "CLIENT" ? clientLinks : freelancerLinks;
  const workspace = role === "CLIENT" ? "Client workspace" : "Freelancer workspace";

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-sm">
      <div className="mb-7 px-3">
        <div className="text-lg font-extrabold tracking-tight text-slate-950">Freelanzo</div>
        <div className="mt-1 text-xs font-medium text-slate-500">{workspace}</div>
      </div>

      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Menu</p>
      <nav className="flex-1 space-y-1">
        {links.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/client/dashboard" && href !== "/freelancer/dashboard" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-rose-50 text-rose-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span>{label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-rose-500" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">Need a hand?</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Keep your work and conversations organised from one place.</p>
        <Link href="/contact" onClick={() => setMobileOpen(false)} className="mt-3 inline-flex text-xs font-semibold text-rose-600 hover:text-rose-700">
          Get support →
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
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-md"
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
            className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          />
          <div className="fixed bottom-0 left-0 top-20 z-50 lg:hidden">
            {sidebar}
          </div>
        </>
      )}
    </>
  );
}
