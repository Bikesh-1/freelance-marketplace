import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import Navbar from "@/components/layout/navbar";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "CLIENT") {
    redirect("/freelancer/dashboard");
  }

  const profile = await prisma.clientProfile.findUnique({
    where: {
      userId: (session.user as any).id,
    },
  });

  if (!profile) {
    redirect("/client/profile");
  }

  if (!profile.isProfileCompleted) {
    redirect("/client/profile");
  }

  const getProgress = (status: string) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "FUNDED":
        return 20;
      case "SUBMITTED":
        return 60;
      case "APPROVED":
        return 80;
      case "RELEASED":
        return 100;
      case "REFUNDED":
        return 100;
      default:
        return 0;
    }
  };

  /* ============================================================
     STATS
  ============================================================ */

  const totalJobs = await prisma.job.count({
    where: {
      clientId: profile.id,
    },
  });

  const activeJobs = await prisma.job.count({
    where: {
      clientId: profile.id,
      status: "OPEN",
    },
  });

  const totalApplications = await prisma.application.count({
    where: {
      job: {
        clientId: profile.id,
      },
    },
  });

  const escrowLocked = await prisma.escrow.aggregate({
    where: {
      job: {
        clientId: profile.id,
      },
      status: "FUNDED",
    },
    _sum: {
      amount: true,
    },
  });

  const escrowBalance = escrowLocked._sum.amount || 0;

  const recentJobs = await prisma.job.findMany({
    where: {
      clientId: profile.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const recentApplications = await prisma.application.findMany({
    where: {
      job: {
        clientId: profile.id,
      },
    },
    include: {
      freelancer: {
        include: {
          user: true,
        },
      },
      job: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const recentMessages = await prisma.message.findMany({
    where: {
      senderId: session.user.id,
    },
    include: {
      job: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const milestones = await prisma.milestone.findMany({
    where: {
      job: {
        clientId: profile.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      isRead: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  /*
   * Existing project behavior:
   * escrow amount is being displayed as wallet balance.
   * Keeping this unchanged so backend behavior is not affected.
   */
  const walletBalance = escrowBalance;

  const walletConnected = true;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <section className="mb-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />

                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Client Workspace
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                  Welcome back, {profile.companyName}
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                  Manage your projects, freelancers, payments and milestones
                  from one place.
                </p>
              </div>

              <div className="flex items-center gap-3">

                {/* Notifications */}

                <Link
                  href="/notifications"
                  className="relative flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                  <span className="text-base">♢</span>

                  <span className="hidden sm:inline">
                    Notifications
                  </span>

                  {notifications.length > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {notifications.length}
                    </span>
                  )}
                </Link>

                <ConnectWalletButton />

              </div>
            </div>
          </section>

          {/* =====================================================
              STATS
          ===================================================== */}

          <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

            {/* Wallet */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <span className="text-xs font-medium text-neutral-500">
                  Wallet Balance
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-sm text-red-500">
                  ◇
                </span>

              </div>

              <p className="text-2xl font-bold tracking-tight text-neutral-950">
                {walletBalance}
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                ETH
              </p>

            </div>

            {/* Escrow */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <span className="text-xs font-medium text-neutral-500">
                  Escrow Locked
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-sm">
                  ◈
                </span>

              </div>

              <p className="text-2xl font-bold tracking-tight text-neutral-950">
                {escrowBalance}
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                ETH secured
              </p>

            </div>

            {/* Active Jobs */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <span className="text-xs font-medium text-neutral-500">
                  Open Jobs
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-sm">
                  ◷
                </span>

              </div>

              <p className="text-2xl font-bold tracking-tight text-neutral-950">
                {activeJobs}
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                Currently hiring
              </p>

            </div>

            {/* Applications */}

            <div className="col-span-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:col-span-1">

              <div className="mb-4 flex items-center justify-between">

                <span className="text-xs font-medium text-neutral-500">
                  Applications
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-sm">
                  ≡
                </span>

              </div>

              <p className="text-2xl font-bold tracking-tight text-neutral-950">
                {totalApplications}
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                Received from freelancers
              </p>

            </div>

          </section>

          {/* =====================================================
              QUICK ACTIONS
          ===================================================== */}

          <section className="mb-8 overflow-hidden rounded-2xl bg-neutral-950 shadow-sm">

            <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Manage your work
                </p>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Quick actions
                </h2>

              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                {/* Primary */}

                <Link
                  href="/client/jobs/create"
                  className="rounded-xl bg-red-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-400"
                >
                  Post a Job
                </Link>

                <Link
                  href="/client/jobs"
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800"
                >
                  Manage Jobs
                </Link>

                <Link
                  href="/wallet"
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800"
                >
                  Wallet
                </Link>

                <Link
                  href="/message"
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800"
                >
                  Messages
                </Link>

              </div>

            </div>
          </section>

          {/* =====================================================
              JOBS + APPLICATIONS
          ===================================================== */}

          <div className="grid gap-6 lg:grid-cols-2">

            {/* =================================================
                RECENT JOBS
            ================================================= */}

            <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-5 sm:px-6">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-red-500" />

                    <h2 className="text-base font-semibold text-neutral-950">
                      Recent Jobs
                    </h2>

                  </div>

                  <p className="mt-1 text-xs text-neutral-500">
                    Your latest posted projects
                  </p>

                </div>

                <Link
                  href="/client/jobs"
                  className="text-xs font-semibold text-neutral-500 transition hover:text-red-500"
                >
                  View all →
                </Link>

              </div>

              <div className="p-4 sm:p-5">

                {recentJobs.length === 0 ? (

                  <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-5 py-10 text-center">

                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm">
                      +
                    </div>

                    <p className="text-sm font-medium text-neutral-700">
                      No jobs posted yet
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      Create your first job and start hiring.
                    </p>

                    <Link
                      href="/client/jobs/create"
                      className="mt-4 inline-flex rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                    >
                      Post a Job
                    </Link>

                  </div>

                ) : (

                  <div className="space-y-2">

                    {recentJobs.map((job) => (

                      <Link
                        key={job.id}
                        href={`/client/jobs/${job.id}`}
                        className="group block rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition hover:border-neutral-200 hover:bg-white hover:shadow-sm"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <h3 className="truncate text-sm font-semibold text-neutral-900 transition group-hover:text-red-500">
                              {job.title}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">

                              <span className="font-semibold text-neutral-700">
                                ${job.budget}
                              </span>

                              <span className="text-neutral-300">
                                •
                              </span>

                              <span>
                                Posted recently
                              </span>

                            </div>

                          </div>

                          <span className="shrink-0 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
                            {job.status.replace("_", " ")}
                          </span>

                        </div>

                      </Link>

                    ))}

                  </div>

                )}

              </div>

            </section>

            {/* =================================================
                APPLICATIONS
            ================================================= */}

            <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-5 sm:px-6">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-neutral-900" />

                    <h2 className="text-base font-semibold text-neutral-950">
                      Recent Applications
                    </h2>

                  </div>

                  <p className="mt-1 text-xs text-neutral-500">
                    Freelancers applying to your jobs
                  </p>

                </div>

                <Link
                  href="/client/jobs"
                  className="text-xs font-semibold text-neutral-500 transition hover:text-red-500"
                >
                  View all →
                </Link>

              </div>

              <div className="p-4 sm:p-5">

                {recentApplications.length === 0 ? (

                  <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-5 py-10 text-center">

                    <p className="text-sm font-medium text-neutral-700">
                      No applications yet
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      Applications from freelancers will appear here.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-2">

                    {recentApplications.map((app) => (

                      <div
                        key={app.id}
                        className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition hover:border-neutral-200 hover:bg-white hover:shadow-sm"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex min-w-0 items-center gap-3">

                            {/* Avatar */}

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                              {app.freelancer.fullName
                                ?.charAt(0)
                                ?.toUpperCase() || "F"}
                            </div>

                            <div className="min-w-0">

                              <h3 className="truncate text-sm font-semibold text-neutral-900">
                                {app.freelancer.fullName}
                              </h3>

                              <p className="mt-1 truncate text-xs text-neutral-500">
                                {app.job.title}
                              </p>

                            </div>

                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                              app.status === "ACCEPTED"
                                ? "bg-neutral-900 text-white"
                                : app.status === "REJECTED"
                                  ? "bg-red-50 text-red-500"
                                  : "bg-neutral-100 text-neutral-500"
                            }`}
                          >
                            {app.status}
                          </span>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </section>

          </div>

          {/* =====================================================
              MILESTONE PROGRESS
          ===================================================== */}

          <section className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-5 sm:px-6">

              <div>

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-red-500" />

                  <h2 className="text-base font-semibold text-neutral-950">
                    Milestone Progress
                  </h2>

                </div>

                <p className="mt-1 text-xs text-neutral-500">
                  Track payment and project progress
                </p>

              </div>

              <Link
                href="/client/jobs"
                className="text-xs font-semibold text-neutral-500 transition hover:text-red-500"
              >
                View all →
              </Link>

            </div>

            <div className="p-4 sm:p-5">

              {milestones.length === 0 ? (

                <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-5 py-10 text-center">

                  <p className="text-sm font-medium text-neutral-700">
                    No milestones yet
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    Milestones for your projects will appear here.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {milestones.map((m) => {

                    const progress = getProgress(m.status);

                    return (

                      <div
                        key={m.id}
                        className="rounded-xl border border-neutral-100 bg-neutral-50 p-4"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <h3 className="truncate text-sm font-semibold text-neutral-900">
                              {m.title}
                            </h3>

                            <p className="mt-1 text-xs text-neutral-500">
                              Milestone payment
                            </p>

                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                              m.status === "RELEASED"
                                ? "bg-neutral-900 text-white"
                                : m.status === "PENDING"
                                  ? "bg-neutral-200 text-neutral-600"
                                  : "bg-red-50 text-red-500"
                            }`}
                          >
                            {m.status}
                          </span>

                        </div>

                        {/* Progress */}

                        <div className="mt-4">

                          <div className="mb-2 flex items-center justify-between">

                            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                              Progress
                            </span>

                            <span className="text-xs font-bold text-neutral-800">
                              {progress}%
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-neutral-200">

                            <div
                              className="h-full rounded-full bg-red-500 transition-all duration-500"
                              style={{
                                width: `${progress}%`,
                              }}
                            />

                          </div>

                        </div>

                        {/* Amount */}

                        <div className="mt-4 flex items-center justify-between">

                          <span className="text-xs text-neutral-500">
                            Amount
                          </span>

                          <span className="text-sm font-semibold text-neutral-900">
                            ${m.amount}
                          </span>

                        </div>

                      </div>

                    );
                  })}

                </div>

              )}

            </div>

          </section>

          {/* =====================================================
              WALLET
          ===================================================== */}

          <section className="mt-6 overflow-hidden rounded-2xl bg-neutral-950 shadow-sm">

            <div className="border-b border-neutral-800 px-5 py-5 sm:px-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-lg text-red-500">
                    ◇
                  </div>

                  <div>

                    <h2 className="text-base font-semibold text-white">
                      Blockchain Wallet
                    </h2>

                    <p className="mt-1 text-xs text-neutral-500">
                      Manage your payment wallet
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <span
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      walletConnected
                        ? "bg-white/10 text-white"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >

                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        walletConnected
                          ? "bg-green-400"
                          : "bg-red-500"
                      }`}
                    />

                    {walletConnected
                      ? "Connected"
                      : "Not connected"}

                  </span>

                </div>

              </div>

            </div>

            <div className="p-5 sm:p-6">

              <div className="grid gap-5 lg:grid-cols-[1fr_auto]">

                {/* Wallet info */}

                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    Payment Wallet
                  </p>

                  <p className="mt-3 text-sm font-medium text-white">
                    Wallet connected
                  </p>

                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    Your wallet is ready for blockchain-based escrow
                    payments and project transactions.
                  </p>

                </div>

                {/* Actions */}

                <div className="flex min-w-[220px] flex-col justify-center gap-3">

                  <ConnectWalletButton />

                  <Link
                    href="/wallet"
                    className="rounded-xl border border-neutral-800 px-5 py-3 text-center text-sm font-semibold text-neutral-300 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
                  >
                    Manage Wallet
                  </Link>

                </div>

              </div>

              {/* Wallet stats */}

              <div className="mt-5 grid gap-3 sm:grid-cols-3">

                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">

                  <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                    Wallet Balance
                  </p>

                  <p className="mt-2 text-lg font-bold text-white">
                    {walletBalance}{" "}
                    <span className="text-xs font-normal text-neutral-500">
                      ETH
                    </span>
                  </p>

                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">

                  <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                    Escrow Locked
                  </p>

                  <p className="mt-2 text-lg font-bold text-white">
                    {escrowBalance}{" "}
                    <span className="text-xs font-normal text-neutral-500">
                      ETH
                    </span>
                  </p>

                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">

                  <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                    Total Projects
                  </p>

                  <p className="mt-2 text-lg font-bold text-red-400">
                    {totalJobs}
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              RECENT MESSAGES
          ===================================================== */}

          <section className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-5 sm:px-6">

              <div>

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-red-500" />

                  <h2 className="text-base font-semibold text-neutral-950">
                    Recent Messages
                  </h2>

                </div>

                <p className="mt-1 text-xs text-neutral-500">
                  Latest conversations and updates
                </p>

              </div>

              <Link
                href="/message"
                className="text-xs font-semibold text-neutral-500 transition hover:text-red-500"
              >
                Open inbox →
              </Link>

            </div>

            <div className="p-4 sm:p-5">

              {recentMessages.length === 0 ? (

                <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-5 py-10 text-center">

                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm">
                    •
                  </div>

                  <p className="text-sm font-medium text-neutral-700">
                    No messages yet
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    Your conversations will appear here.
                  </p>

                </div>

              ) : (

                <div className="space-y-2">

                  {recentMessages.map((msg) => (

                    <Link
                      key={msg.id}
                      href="/message"
                      className="group block rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition hover:border-neutral-200 hover:bg-white hover:shadow-sm"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                          {msg.senderId
                            ?.toString()
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="text-sm font-semibold text-neutral-900">
                            Conversation
                          </p>

                          <p className="mt-1 truncate text-xs text-neutral-500 group-hover:text-neutral-700">
                            {msg.content}
                          </p>

                        </div>

                        <span className="hidden text-neutral-300 transition group-hover:text-red-500 sm:block">
                          →
                        </span>

                      </div>

                    </Link>

                  ))}

                </div>

              )}

            </div>

          </section>

          {/* Footer link */}

          <div className="flex justify-end pb-4 pt-1">

            <Link
              href="/client/jobs"
              className="text-xs font-semibold text-neutral-500 transition hover:text-red-500"
            >
              Manage all projects →
            </Link>

          </div>

        </div>
      </main>
    </>
  );
}