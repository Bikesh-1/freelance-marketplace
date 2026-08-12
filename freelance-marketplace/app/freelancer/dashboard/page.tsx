"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";

export default function FreelancerDashboard() {
  const { data: session } = useSession();

  const [walletConnected] = useState(true);

  // Demo data (later replace with TanStack Query hooks)
  const stats = {
    walletBalance: 4.25,
    escrowBalance: 1.75,
    averageRating: 4.9,
    activeJobs: 3,
    pendingApplications: 5,
    unreadNotifications: 4,
  };

  const recentJobs = [
    {
      id: "1",
      title: "Build Next.js SaaS Dashboard",
      budget: "$1,200",
      status: "In Progress",
    },
    {
      id: "2",
      title: "React Native Mobile App",
      budget: "$2,500",
      status: "Awaiting Payment",
    },
  ];

  const recentApplications = [
    {
      id: "1",
      title: "Full Stack Marketplace",
      status: "Pending",
    },
    {
      id: "2",
      title: "AI Resume Builder",
      status: "Shortlisted",
    },
  ];

  const recentMessages = [
    {
      id: "1",
      from: "Acme Corp",
      message: "Can you deliver milestone 1 today?",
    },
    {
      id: "2",
      from: "StartupX",
      message: "We loved your proposal.",
    },
  ];

  const milestones = [
    {
      id: "1",
      title: "UI Design",
      progress: 100,
      status: "Released",
    },
    {
      id: "2",
      title: "API Integration",
      progress: 70,
      status: "In Review",
    },
    {
      id: "3",
      title: "Deployment",
      progress: 20,
      status: "Pending",
    },
  ];

  return (
    <> <Navbar />

      ```
      <main className="min-h-screen bg-slate-950 px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Freelancer Dashboard
              </h1>
              <p className="mt-2 text-slate-400">
                Welcome back, {session?.user?.name || "Freelancer"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/notifications"
                className="relative rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white hover:border-slate-700"
              >
                Notifications
                {stats.unreadNotifications > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                    {stats.unreadNotifications}
                  </span>
                )}
              </Link>

              <ConnectWalletButton />
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Wallet Balance</p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {stats.walletBalance} ETH
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Escrow Balance</p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {stats.escrowBalance} ETH
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Average Rating</p>
              <h2 className="mt-2 text-3xl font-bold text-yellow-400">
                {stats.averageRating} ★
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Active Jobs</p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {stats.activeJobs}
              </h2>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">
              Quick Actions
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/jobs"
                className="rounded-xl bg-indigo-600 px-4 py-3 text-center font-medium text-white hover:bg-indigo-500"
              >
                Browse Jobs
              </Link>

              <Link
                href="/applications"
                className="rounded-xl border border-slate-700 px-4 py-3 text-center font-medium text-white hover:border-slate-600"
              >
                My Applications
              </Link>

              <Link
                href="/wallet"
                className="rounded-xl border border-slate-700 px-4 py-3 text-center font-medium text-white hover:border-slate-600"
              >
                Wallet
              </Link>

              <Link
                href="/messages"
                className="rounded-xl border border-slate-700 px-4 py-3 text-center font-medium text-white hover:border-slate-600"
              >
                Messages
              </Link>
            </div>
          </div>

          {/* Wallet Status */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Blockchain Wallet
                </h2>
                <p className="mt-1 text-slate-400">
                  Connected wallet status
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${walletConnected
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                  }`}
              >
                {walletConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          {/* Recent Jobs + Applications */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Active Jobs
                </h2>

                <Link
                  href="/jobs"
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-slate-800 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">
                          {job.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {job.budget}
                        </p>
                      </div>

                      <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Applications
                </h2>

                <Link
                  href="/applications"
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="rounded-xl border border-slate-800 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">
                        {app.title}
                      </h3>

                      <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Milestone Progress
              </h2>

              <Link
                href="/milestones"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {milestones.map((m) => (
                <div key={m.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-white">
                      {m.title}
                    </span>

                    <span className="text-sm text-slate-400">
                      {m.progress}% • {m.status}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Recent Messages
              </h2>

              <Link
                href="/messages"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Open inbox
              </Link>
            </div>

            <div className="space-y-4">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-xl border border-slate-800 p-4"
                >
                  <p className="font-semibold text-white">
                    {msg.from}
                  </p>
                  <p className="mt-1 text-slate-400">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>


  );
}
