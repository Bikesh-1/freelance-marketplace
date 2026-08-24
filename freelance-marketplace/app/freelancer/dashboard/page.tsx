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

  // Real Database Statistics
  const activeJobsCount = await prisma.job.count({
    where: {
      selectedFreelancerId: profile.id,
      status: "IN_PROGRESS",
    },
  });

  const completedJobsCount =
    await prisma.job.count({
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

  const earningsSum =
    await prisma.escrow.aggregate({
      where: {
        job: {
          selectedFreelancerId:
            profile.id,
        },
        status: "RELEASED",
      },
      _sum: {
        amount: true,
      },
    });

  const totalEarnings =
    earningsSum._sum.amount || 0;

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
        { receiverId: session.user.id },
        { senderId: session.user.id },
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Freelancer Dashboard
              </h1>
              <p className="mt-2 text-slate-400">
                Welcome back, {profile.fullName || profile.user.name}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/notifications"
                className="relative rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white hover:border-slate-700"
              >
                Notifications
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                    {unreadNotificationsCount}
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
                {walletBalance} ETH
              </h2>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Total Earnings
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-400">
                {totalEarnings.toFixed(4)} ETH
              </h2>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Completed Jobs
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {completedJobsCount}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Escrow Balance</p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {escrowBalance} ETH
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Average Rating</p>
              <h2 className="mt-2 text-3xl font-bold text-yellow-400">
                {averageRating.toFixed(1)} ★
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Active Jobs</p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {activeJobsCount}
              </h2>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">
              Quick Actions
            </h2>
            <Link
              href="/freelancer/completed"
              className="rounded-xl border border-slate-700 px-4 py-3 text-center font-medium text-white hover:border-slate-600"
            >
              Completed Jobs
            </Link>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/jobs"
                className="rounded-xl bg-indigo-600 px-4 py-3 text-center font-medium text-white hover:bg-indigo-500"
              >
                Browse Jobs
              </Link>

              <Link
                href="/freelancer/applications"
                className="rounded-xl border border-slate-700 px-4 py-3 text-center font-medium text-white hover:border-slate-600"
              >
                My Applications ({pendingApplicationsCount})
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
                  {profile.user.walletAddress
                    ? `Connected: ${profile.user.walletAddress.slice(0, 6)}...${profile.user.walletAddress.slice(-4)}`
                    : "No wallet address linked to account"}
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

              {recentJobs.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">
                  No active jobs found. Browse open listings to apply.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-slate-800 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/freelancer/jobs/${job.id}`}
                            className="font-semibold text-white hover:text-indigo-400"
                          >
                            {job.title}
                          </Link>
                          <p className="text-sm text-slate-400">
                            Budget: ${job.budget} • Client: {job.client.companyName}
                          </p>
                        </div>

                        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  My Applications
                </h2>

                <Link
                  href="/applications"
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  View all
                </Link>
              </div>

              {recentApplications.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">
                  No applications submitted yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-xl border border-slate-800 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/jobs/${app.job.id}`}
                            className="font-semibold text-white hover:text-indigo-400"
                          >
                            {app.job.title}
                          </Link>
                          <p className="text-sm text-slate-400">
                            Proposed: ${app.proposedBudget}
                          </p>
                        </div>

                        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Milestones */}
          {/* Milestones */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Milestone Progress
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Track your active work and submit completed milestones
                </p>
              </div>

              <Link
                href="/freelancer/jobs"
                className="text-sm text-indigo-400 hover:text-indigo-300">
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
                      className="rounded-xl border border-slate-800 p-5"
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
                          className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${m.status === "PENDING"
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

                      {/* Amount + Progress */}
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
                          className="flex-1 rounded-lg border border-slate-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:border-slate-600 hover:bg-slate-800"
                        >
                          View Milestones
                        </Link>

                        {m.status === "FUNDED" && (
                          <Link
                            href={`/freelancer/jobs/${m.job.id}/milestones`}
                            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-500"
                          >
                            Submit Work
                          </Link>
                        )}

                        {m.status === "SUBMITTED" && (
                          <div className="flex-1 rounded-lg border border-yellow-700 bg-yellow-900/20 px-4 py-2.5 text-center text-sm font-medium text-yellow-400">
                            Waiting for Client Approval
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

            {recentMessages.length === 0 ? (
              <p className="text-slate-400 text-sm py-4">
                No messages yet.
              </p>
            ) : (
              <div className="space-y-4">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-xl border border-slate-800 p-4"
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-white">
                        {msg.sender.name}
                      </p>
                      <span className="text-xs text-slate-500">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-400 text-sm">
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
