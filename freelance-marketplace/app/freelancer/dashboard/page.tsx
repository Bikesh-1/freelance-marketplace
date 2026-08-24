import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import Navbar from "@/components/layout/navbar";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";

export default async function FreelancerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  if ((session.user as { role?: string }).role !== "FREELANCER") {
    redirect("/client/dashboard");
  }

  const profile = await prisma.freelancerProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      user: true,
    },
  });

  if (!profile || !profile.isProfileCompleted) {
    redirect("/freelancer/profile");
  }

  // -----------------------------------------
  // REAL DATABASE STATISTICS
  // -----------------------------------------

  const activeJobsCount = await prisma.job.count({
    where: {
      selectedFreelancerId: profile.id,
      status: "IN_PROGRESS",
    },
  });

  const completedJobsCount = await prisma.job.count({
    where: {
      selectedFreelancerId: profile.id,
      status: "COMPLETED",
    },
  });

  const pendingApplicationsCount =
    await prisma.application.count({
      where: {
        freelancerId: profile.id,
        status: "PENDING",
      },
    });

  const unreadNotificationsCount =
    await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

  // -----------------------------------------
  // ESCROW BALANCE
  // -----------------------------------------

  const escrowSum = await prisma.escrow.aggregate({
    where: {
      job: {
        selectedFreelancerId: profile.id,
      },
      status: "FUNDED",
    },
    _sum: {
      amount: true,
    },
  });

  // -----------------------------------------
  // TOTAL EARNINGS
  // -----------------------------------------

  const earningsSum = await prisma.escrow.aggregate({
    where: {
      job: {
        selectedFreelancerId: profile.id,
      },
      status: "RELEASED",
    },
    _sum: {
      amount: true,
    },
  });

  const totalEarnings = earningsSum._sum.amount || 0;

  // -----------------------------------------
  // RECENT JOBS
  // -----------------------------------------

  const recentJobs = await prisma.job.findMany({
    where: {
      selectedFreelancerId: profile.id,
    },
    include: {
      client: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  });

  // -----------------------------------------
  // RECENT APPLICATIONS
  // -----------------------------------------

  const recentApplications =
    await prisma.application.findMany({
      where: {
        freelancerId: profile.id,
      },
      include: {
        job: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

  // -----------------------------------------
  // RECENT MESSAGES
  // -----------------------------------------

  const recentMessages = await prisma.message.findMany({
    where: {
      OR: [
        {
          receiverId: session.user.id,
        },
        {
          senderId: session.user.id,
        },
      ],
    },
    include: {
      sender: true,
      job: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  // -----------------------------------------
  // MILESTONES
  // -----------------------------------------

  const milestones = await prisma.milestone.findMany({
    where: {
      job: {
        selectedFreelancerId: profile.id,
      },
    },
    include: {
      job: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  // -----------------------------------------
  // MILESTONE PROGRESS
  // -----------------------------------------

  const getProgress = (status: string) => {
    switch (status) {
      case "PENDING":
        return 0;

      case "FUNDED":
        return 25;

      case "SUBMITTED":
        return 60;

      case "APPROVED":
        return 85;

      case "RELEASED":
        return 100;

      case "REFUNDED":
        return 100;

      default:
        return 0;
    }
  };

  // -----------------------------------------
  // WALLET
  // -----------------------------------------

  const walletBalance = profile.walletBalance || 0;

  const escrowBalance = escrowSum._sum.amount || 0;

  const averageRating = profile.averageRating || 0;

  const walletConnected =
    !!profile.user.walletAddress;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* =========================================
              HEADER
          ========================================= */}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Freelancer Dashboard
              </h1>

              <p className="mt-2 text-slate-400">
                Welcome back,{" "}
                {profile.fullName || profile.user.name}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white transition hover:border-slate-700"
              >
                Notifications

                {unreadNotificationsCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Link>

              {/* Wallet */}
              <ConnectWalletButton />
            </div>
          </div>

          {/* =========================================
              STATS
          ========================================= */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {/* Wallet Balance */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Wallet Balance
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {walletBalance} ETH
              </h2>
            </div>

            {/* Total Earnings */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Total Earnings
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-400">
                {totalEarnings.toFixed(4)} ETH
              </h2>
            </div>

            {/* Completed Jobs */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Completed Jobs
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {completedJobsCount}
              </h2>
            </div>

            {/* Escrow Balance */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Escrow Balance
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {escrowBalance} ETH
              </h2>
            </div>

            {/* Average Rating */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Average Rating
              </p>

              <h2 className="mt-2 text-3xl font-bold text-yellow-400">
                {averageRating.toFixed(1)} ★
              </h2>
            </div>

            {/* Active Jobs */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Active Jobs
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {activeJobsCount}
              </h2>
            </div>

          </div>

          {/* =========================================
              QUICK ACTIONS
          ========================================= */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Quick Actions
              </h2>

              <Link
                href="/freelancer/completed"
                className="rounded-xl border border-slate-700 px-4 py-3 text-center text-sm font-medium text-white transition hover:border-slate-600 hover:bg-slate-800"
              >
                Completed Jobs
              </Link>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              <Link
                href="/jobs"
                className="rounded-xl bg-indigo-600 px-4 py-3 text-center font-medium text-white transition hover:bg-indigo-500"
              >
                Browse Jobs
              </Link>

              <Link
                href="/freelancer/applications"
                className="rounded-xl border border-slate-700 px-4 py-3 text-center font-medium text-white transition hover:border-slate-600 hover:bg-slate-800"
              >
                My Applications (
                {pendingApplicationsCount}
                )
              </Link>

              <Link
                href="/wallet"
                className="rounded-xl border border-slate-700 px-4 py-3 text-center font-medium text-white transition hover:border-slate-600 hover:bg-slate-800"
              >
                Wallet
              </Link>

              <Link
                href="/messages"
                className="rounded-xl border border-slate-700 px-4 py-3 text-center font-medium text-white transition hover:border-slate-600 hover:bg-slate-800"
              >
                Messages
              </Link>

            </div>
          </div>

          {/* =========================================
              BLOCKCHAIN WALLET
          ========================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

            {/* Wallet Header */}
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-xl">
                      🔗
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Blockchain Wallet
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        Manage your wallet for milestone payments.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div
                  className={`flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                    walletConnected
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      walletConnected
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                  />

                  {walletConnected
                    ? "Connected"
                    : "Disconnected"}
                </div>

              </div>
            </div>

            {/* Wallet Body */}
            <div className="p-6">

              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">

                {/* Wallet Information */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-2xl">
                      💳
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-300">
                        Payment Wallet
                      </p>

                      {profile.user.walletAddress ? (
                        <>
                          <p className="mt-2 break-all font-mono text-sm text-indigo-400">
                            {profile.user.walletAddress}
                          </p>

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            This wallet address will be used to receive
                            milestone payments from clients.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="mt-2 text-sm font-medium text-yellow-400">
                            Wallet not connected
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Connect your wallet before starting
                            blockchain milestone payments.
                          </p>
                        </>
                      )}
                    </div>

                  </div>

                </div>

                {/* Wallet Action */}
                <div className="flex min-w-[220px] flex-col items-stretch gap-3">

                  <ConnectWalletButton />

                  {walletConnected ? (
                    <p className="text-center text-xs text-slate-500">
                      Your wallet is ready to receive payments.
                    </p>
                  ) : (
                    <p className="text-center text-xs text-slate-500">
                      Connect MetaMask to receive payments.
                    </p>
                  )}

                </div>

              </div>

              {/* Payment Information */}
              <div className="mt-5 grid gap-4 md:grid-cols-3">

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Wallet Balance
                  </p>

                  <p className="mt-2 text-lg font-semibold text-white">
                    {walletBalance} ETH
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Escrow Balance
                  </p>

                  <p className="mt-2 text-lg font-semibold text-white">
                    {escrowBalance} ETH
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Total Earnings
                  </p>

                  <p className="mt-2 text-lg font-semibold text-green-400">
                    {totalEarnings.toFixed(4)} ETH
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* =========================================
              RECENT JOBS + APPLICATIONS
          ========================================= */}

          <div className="grid gap-6 lg:grid-cols-2">

            {/* Active Jobs */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Active Jobs
                </h2>

                <Link
                  href="/jobs"
                  className="text-sm text-indigo-400 transition hover:text-indigo-300"
                >
                  View all
                </Link>
              </div>

              {recentJobs.length === 0 ? (
                <p className="py-4 text-sm text-slate-400">
                  No active jobs found. Browse open listings to apply.
                </p>
              ) : (
                <div className="space-y-4">

                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-slate-800 p-4 transition hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between gap-4">

                        <div className="min-w-0">
                          <Link
                            href={`/freelancer/jobs/${job.id}`}
                            className="font-semibold text-white transition hover:text-indigo-400"
                          >
                            {job.title}
                          </Link>

                          <p className="mt-1 text-sm text-slate-400">
                            Budget: ${job.budget} • Client:{" "}
                            {job.client.companyName}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                          {job.status}
                        </span>

                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>

            {/* My Applications */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  My Applications
                </h2>

                <Link
                  href="/applications"
                  className="text-sm text-indigo-400 transition hover:text-indigo-300"
                >
                  View all
                </Link>
              </div>

              {recentApplications.length === 0 ? (
                <p className="py-4 text-sm text-slate-400">
                  No applications submitted yet.
                </p>
              ) : (
                <div className="space-y-4">

                  {recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-xl border border-slate-800 p-4 transition hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between gap-4">

                        <div className="min-w-0">
                          <Link
                            href={`/jobs/${app.job.id}`}
                            className="font-semibold text-white transition hover:text-indigo-400"
                          >
                            {app.job.title}
                          </Link>

                          <p className="mt-1 text-sm text-slate-400">
                            Proposed: ${app.proposedBudget}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                          {app.status}
                        </span>

                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>

          </div>

          {/* =========================================
              MILESTONE PROGRESS
          ========================================= */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-semibold text-white">
                  Milestone Progress
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Track your active work and submit completed milestones.
                </p>
              </div>

              <Link
                href="/freelancer/jobs"
                className="text-sm text-indigo-400 transition hover:text-indigo-300"
              >
                View all
              </Link>

            </div>

            {milestones.length === 0 ? (
              <div className="rounded-xl border border-slate-800 p-6 text-center">
                <p className="text-sm text-slate-400">
                  No active milestones at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-5">

                {milestones.map((m) => {
                  const progress = getProgress(m.status);

                  return (
                    <div
                      key={m.id}
                      className="rounded-xl border border-slate-800 p-5 transition hover:border-slate-700"
                    >

                      {/* Header */}
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                        <div>
                          <h3 className="font-semibold text-white">
                            {m.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            Job: {m.job.title}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                            m.status === "PENDING"
                              ? "bg-slate-800 text-slate-300"
                              : m.status === "FUNDED"
                                ? "bg-blue-500/20 text-blue-400"
                                : m.status === "SUBMITTED"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : m.status === "APPROVED"
                                    ? "bg-indigo-500/20 text-indigo-400"
                                    : m.status === "RELEASED"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {m.status}
                        </span>

                      </div>

                      {/* Progress */}
                      <div className="mt-5">

                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm text-slate-400">
                            Progress
                          </span>

                          <span className="text-sm font-medium text-white">
                            {progress}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        <div className="mt-2 flex justify-between text-xs text-slate-500">

                          <span>
                            Amount: ${m.amount}
                          </span>

                          {m.dueDate && (
                            <span>
                              Due:{" "}
                              {new Date(
                                m.dueDate
                              ).toLocaleDateString()}
                            </span>
                          )}

                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                        <Link
                          href={`/freelancer/jobs/${m.job.id}/milestones`}
                          className="flex-1 rounded-lg border border-slate-700 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:border-slate-600 hover:bg-slate-800"
                        >
                          View Milestones
                        </Link>

                        {m.status === "FUNDED" && (
                          <Link
                            href={`/freelancer/jobs/${m.job.id}/milestones`}
                            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-indigo-500"
                          >
                            Submit Work
                          </Link>
                        )}

                        {m.status === "PENDING" && (
                          <div className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-center text-sm font-medium text-slate-500">
                            Waiting for Client Funding
                          </div>
                        )}

                        {m.status === "SUBMITTED" && (
                          <div className="flex-1 rounded-lg border border-yellow-700 bg-yellow-900/20 px-4 py-2.5 text-center text-sm font-medium text-yellow-400">
                            Waiting for Client Approval
                          </div>
                        )}

                        {m.status === "APPROVED" && (
                          <div className="flex-1 rounded-lg border border-indigo-700 bg-indigo-900/20 px-4 py-2.5 text-center text-sm font-medium text-indigo-400">
                            Awaiting Payment Release
                          </div>
                        )}

                        {m.status === "RELEASED" && (
                          <div className="flex-1 rounded-lg border border-green-700 bg-green-900/20 px-4 py-2.5 text-center text-sm font-medium text-green-400">
                            Payment Released
                          </div>
                        )}

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

          {/* =========================================
              RECENT MESSAGES
          ========================================= */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-4 flex items-center justify-between">

              <h2 className="text-xl font-semibold text-white">
                Recent Messages
              </h2>

              <Link
                href="/messages"
                className="text-sm text-indigo-400 transition hover:text-indigo-300"
              >
                Open inbox
              </Link>

            </div>

            {recentMessages.length === 0 ? (
              <p className="py-4 text-sm text-slate-400">
                No messages yet.
              </p>
            ) : (
              <div className="space-y-4">

                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-xl border border-slate-800 p-4 transition hover:border-slate-700"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <p className="font-semibold text-white">
                        {msg.sender.name}
                      </p>

                      <span className="text-xs text-slate-500">
                        {new Date(
                          msg.createdAt
                        ).toLocaleDateString()}
                      </span>

                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      {msg.content}
                    </p>

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>
      </main>
    </>
  );
}