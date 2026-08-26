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

  const pendingApplicationsCount = await prisma.application.count({
    where: {
      freelancerId: profile.id,
      status: "PENDING",
    },
  });

  const unreadNotificationsCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
    },
  });

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

  const recentApplications = await prisma.application.findMany({
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

  const walletBalance = profile.walletBalance || 0;
  const escrowBalance = escrowSum._sum.amount || 0;
  const averageRating = profile.averageRating || 0;
  const walletConnected = !!profile.user.walletAddress;

  const freelancerName =
    profile.fullName || profile.user.name || "Freelancer";

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
                    Freelancer Workspace
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                  Welcome back, {freelancerName.split(" ")[0]}
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                  Manage your projects, applications, milestones and earnings
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
                  <span className="hidden sm:inline">Notifications</span>

                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadNotificationsCount}
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
          <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

            {/* Earnings */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">
                  Total Earnings
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-sm text-red-500">
                  ↗
                </span>
              </div>

              <p className="text-2xl font-bold tracking-tight text-neutral-950">
                {totalEarnings.toFixed(4)}
              </p>

              <p className="mt-1 text-xs text-neutral-400">ETH</p>
            </div>

            {/* Active Jobs */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">
                  Active Jobs
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-sm">
                  ◷
                </span>
              </div>

              <p className="text-2xl font-bold tracking-tight text-neutral-950">
                {activeJobsCount}
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                Currently working
              </p>
            </div>

            {/* Applications */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">
                  Applications
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-sm">
                  ≡
                </span>
              </div>

              <p className="text-2xl font-bold tracking-tight text-neutral-950">
                {pendingApplicationsCount}
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                Awaiting response
              </p>
            </div>

            {/* Escrow */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">
                  In Escrow
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-sm">
                  ◇
                </span>
              </div>

              <p className="text-2xl font-bold tracking-tight text-neutral-950">
                {escrowBalance}
              </p>

              <p className="mt-1 text-xs text-neutral-400">ETH secured</p>
            </div>

            {/* Rating */}
            <div className="col-span-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:col-span-1">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">
                  Rating
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50 text-sm">
                  ★
                </span>
              </div>

              <p className="text-2xl font-bold tracking-tight text-neutral-950">
                {averageRating.toFixed(1)}
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                From completed work
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
                  Get things done
                </p>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Quick actions
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                <Link
                  href="/jobs"
                  className="rounded-xl bg-red-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-400"
                >
                  Browse Jobs
                </Link>

                <Link
                  href="/freelancer/applications"
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800"
                >
                  Applications
                </Link>

                <Link
                  href="/messages"
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800"
                >
                  Messages
                </Link>

                <Link
                  href="/wallet"
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800"
                >
                  Wallet
                </Link>

              </div>
            </div>
          </section>

          {/* =====================================================
              MAIN CONTENT
          ===================================================== */}
          <div className="grid gap-6 lg:grid-cols-2">

            {/* =================================================
                ACTIVE JOBS
            ================================================= */}
            <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-5 sm:px-6">

                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />

                    <h2 className="text-base font-semibold text-neutral-950">
                      Active Jobs
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-neutral-500">
                    Projects you are currently working on
                  </p>
                </div>

                <Link
                  href="/jobs"
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
                      No active jobs
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      Find a project that matches your skills.
                    </p>

                    <Link
                      href="/jobs"
                      className="mt-4 inline-flex rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                    >
                      Browse Jobs
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentJobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/freelancer/jobs/${job.id}`}
                        className="group block rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition hover:border-neutral-200 hover:bg-white hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-neutral-900 transition group-hover:text-red-500">
                              {job.title}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                              <span className="font-medium text-neutral-700">
                                ${job.budget}
                              </span>

                              <span className="text-neutral-300">•</span>

                              <span>
                                {job.client.companyName}
                              </span>
                            </div>
                          </div>

                          <span className="shrink-0 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-500">
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
                MILESTONE PROGRESS
            ================================================= */}
            <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-5 sm:px-6">

                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />

                    <h2 className="text-base font-semibold text-neutral-950">
                      Milestone Progress
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-neutral-500">
                    Track your current project milestones
                  </p>
                </div>

                <Link
                  href="/freelancer/jobs"
                  className="text-xs font-semibold text-neutral-500 transition hover:text-red-500"
                >
                  View all →
                </Link>
              </div>

              <div className="p-4 sm:p-5">

                {milestones.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-5 py-10 text-center">
                    <p className="text-sm font-medium text-neutral-700">
                      No active milestones
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      Your milestone progress will appear here.
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

                              <p className="mt-1 truncate text-xs text-neutral-500">
                                {m.job.title}
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

                          {/* Bottom */}
                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex flex-wrap gap-3 text-[11px] text-neutral-500">

                              <span>
                                Amount{" "}
                                <strong className="text-neutral-800">
                                  ${m.amount}
                                </strong>
                              </span>

                              {m.dueDate && (
                                <span>
                                  Due{" "}
                                  <strong className="text-neutral-800">
                                    {new Date(
                                      m.dueDate
                                    ).toLocaleDateString()}
                                  </strong>
                                </span>
                              )}

                            </div>

                            <div className="flex gap-2">

                              <Link
                                href={`/freelancer/jobs/${m.job.id}/milestones`}
                                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300"
                              >
                                View
                              </Link>

                              {m.status === "FUNDED" && (
                                <Link
                                  href={`/freelancer/jobs/${m.job.id}/milestones`}
                                  className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-400"
                                >
                                  Submit Work
                                </Link>
                              )}

                              {m.status === "PENDING" && (
                                <span className="rounded-lg bg-neutral-200 px-3 py-2 text-xs font-medium text-neutral-500">
                                  Awaiting Funding
                                </span>
                              )}

                              {m.status === "SUBMITTED" && (
                                <span className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-500">
                                  Awaiting Approval
                                </span>
                              )}

                              {m.status === "APPROVED" && (
                                <span className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-500">
                                  Awaiting Release
                                </span>
                              )}

                              {m.status === "RELEASED" && (
                                <span className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white">
                                  ✓ Released
                                </span>
                              )}

                            </div>

                          </div>
                        </div>
                      );
                    })}

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
                      My Applications
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-neutral-500">
                    Track your submitted applications
                  </p>
                </div>

                <Link
                  href="/freelancer/applications"
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
                      Start applying to jobs that match your skills.
                    </p>

                    <Link
                      href="/jobs"
                      className="mt-4 inline-flex rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                    >
                      Find Jobs
                    </Link>

                  </div>
                ) : (
                  <div className="space-y-2">

                    {recentApplications.map((app) => (
                      <Link
                        key={app.id}
                        href={`/jobs/${app.job.id}`}
                        className="group block rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition hover:border-neutral-200 hover:bg-white hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-neutral-900 transition group-hover:text-red-500">
                              {app.job.title}
                            </h3>

                            <p className="mt-2 text-xs text-neutral-500">
                              Proposed budget{" "}
                              <span className="font-semibold text-neutral-800">
                                ${app.proposedBudget}
                              </span>
                            </p>
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
                      </Link>
                    ))}

                  </div>
                )}

              </div>
            </section>

            {/* =================================================
                RECENT MESSAGES
            ================================================= */}
            <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">

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
                  href="/messages"
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
                      Conversations with clients will appear here.
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

                          {/* Avatar */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                            {msg.sender.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center justify-between gap-3">
                              <p className="truncate text-sm font-semibold text-neutral-900">
                                {msg.sender.name}
                              </p>

                              <span className="shrink-0 text-[10px] text-neutral-400">
                                {new Date(
                                  msg.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>

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
          </div>

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
                      Your wallet for milestone payments
                    </p>
                  </div>

                </div>

                <div
                  className={`flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
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

                  {walletConnected ? "Connected" : "Not connected"}
                </div>

              </div>
            </div>

            <div className="p-5 sm:p-6">

              <div className="grid gap-5 lg:grid-cols-[1fr_auto]">

                {/* Wallet address */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    Payment Wallet
                  </p>

                  {profile.user.walletAddress ? (
                    <>
                      <p className="mt-3 break-all font-mono text-sm text-white">
                        {profile.user.walletAddress}
                      </p>

                      <p className="mt-3 text-xs leading-5 text-neutral-500">
                        This wallet is connected to your freelancer account
                        and will receive milestone payments.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-3 text-sm font-semibold text-red-400">
                        Wallet not connected
                      </p>

                      <p className="mt-2 text-xs leading-5 text-neutral-500">
                        Connect MetaMask to receive blockchain milestone
                        payments.
                      </p>
                    </>
                  )}

                </div>

                {/* Wallet action */}
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
                    Escrow
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
                    Total Earnings
                  </p>

                  <p className="mt-2 text-lg font-bold text-red-400">
                    {totalEarnings.toFixed(4)}{" "}
                    <span className="text-xs font-normal text-neutral-500">
                      ETH
                    </span>
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* =====================================================
              COMPLETED JOBS
          ===================================================== */}
          <div className="mt-6 flex justify-end">
            <Link
              href="/freelancer/completed"
              className="text-xs font-semibold text-neutral-500 transition hover:text-red-500"
            >
              View completed jobs →
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}