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

  const getProgress = (
    status: string
  ) => {
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

  const totalApplications =
    await prisma.application.count({
      where: {
        job: {
          clientId: profile.id,
        },
      },
    });

  const escrowLocked =
    await prisma.escrow.aggregate({
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

  const recentJobs = await prisma.job.findMany({
    where: {
      clientId: profile.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const recentApplications =
    await prisma.application.findMany({
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

  const recentMessages =
    await prisma.message.findMany({
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

  const milestones =
    await prisma.milestone.findMany({
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

  const notifications =
    await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

  const walletBalance =
    escrowLocked._sum.amount || 0;

  const walletConnected = true;

  return (
    <> <Navbar />
      <main className="min-h-screen bg-slate-950 px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              {notifications.length}
              <h1 className="text-4xl font-bold text-white">
                Client Dashboard
              </h1>
              <p className="mt-2 text-slate-400">
                Welcome back, {profile.companyName}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/notifications"
                className="relative rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white hover:border-slate-700"
              >
                Notifications
                {notifications.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                    {notifications.length}
                  </span>
                )}
              </Link>

              <ConnectWalletButton />
              <Link href="/wallet">
                Open Wallet
              </Link>
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
              <p className="text-sm text-slate-400">Escrow Locked</p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {escrowLocked._sum.amount || 0} ETH
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Active Jobs</p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {activeJobs}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Applications</p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {totalApplications}
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
                href="/client/jobs/create"
                className="rounded-xl bg-indigo-600 px-4 py-3 text-center font-medium text-white hover:bg-indigo-500"
              >
                Post a Job
              </Link>

              <Link
                href="/client/jobs"
                className="rounded-xl border border-slate-700 px-4 py-3 text-center font-medium text-white hover:border-slate-600"
              >
                Manage Jobs
              </Link>

              <Link
                href="/wallet"
                className="rounded-xl border border-slate-700 px-4 py-3 text-center font-medium text-white hover:border-slate-600"
              >
                Wallet
              </Link>

              <Link
                href={recentJobs.length ? `/jobs/${recentJobs[0].id}/chat` : "/client/jobs"}
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

          {/* Jobs + Applications */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Recent Jobs
                </h2>

                <Link
                  href="/client/jobs"
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
                      <Link href={`/jobs/${job.id}`}>
                        {job.title}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Recent Applications
                </h2>

                <Link
                  href="/client/applications"
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
                      <div>
                        <h3 className="font-semibold text-white">
                          {app.freelancer.fullName}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {app.job.title}
                        </p>
                      </div>

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
                href="/client/milestones"
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
                      {getProgress(m.status)}% • {m.status}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{
                        width: `${getProgress(m.status)}%`,
                      }}
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
                href="/client/applications"
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
                    {msg.senderId}
                  </p>
                  <p className="mt-1 text-slate-400">
                    {msg.content}
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
