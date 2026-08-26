import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";
import TransactionHistory from "@/components/escrow/TransactionHistory";

export default async function EscrowPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "CLIENT") {
    redirect("/login");
  }

  const clientProfile = await prisma.clientProfile.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!clientProfile) {
    redirect("/client/profile");
  }

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      clientId: clientProfile.id,
    },
    include: {
      selectedFreelancer: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              walletAddress: true,
            },
          },
        },
      },

      milestones: {
        include: {
          escrow: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!job) {
    notFound();
  }

  const fundedMilestones = job.milestones.filter(
    (milestone) =>
      milestone.status === "FUNDED" ||
      milestone.status === "SUBMITTED" ||
      milestone.status === "APPROVED"
  );

  const totalProjectValue = job.milestones.reduce(
    (total, milestone) => total + milestone.amount,
    0
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <section className="mb-8">

            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Escrow Workspace
              </span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                  {job.title}
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                  Manage milestone funding, escrow status and
                  transaction history for this project.
                </p>
              </div>

              <span className="w-fit rounded-full border border-neutral-200 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-600 shadow-sm">
                Escrow
              </span>

            </div>

          </section>

          {/* =====================================================
              FREELANCER
          ===================================================== */}

          <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold text-white">
                {job.selectedFreelancer?.user.name
                  ? job.selectedFreelancer.user.name
                      .charAt(0)
                      .toUpperCase()
                  : "F"}
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                  Selected Freelancer
                </p>

                <h2 className="mt-1 text-base font-semibold text-neutral-950">
                  {job.selectedFreelancer
                    ? job.selectedFreelancer.user.name
                    : "No freelancer selected"}
                </h2>
              </div>

            </div>

            {job.selectedFreelancer ? (
              <div className="mt-5 grid gap-3 border-t border-neutral-100 pt-5 sm:grid-cols-2">

                {/* Email */}

                <div className="rounded-xl bg-neutral-50 p-4">

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Email
                  </p>

                  <p className="mt-2 break-all text-sm font-medium text-neutral-800">
                    {job.selectedFreelancer.user.email}
                  </p>

                </div>

                {/* Wallet */}

                <div className="rounded-xl bg-neutral-50 p-4">

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Wallet Address
                  </p>

                  <p className="mt-2 break-all text-xs font-medium text-neutral-600">
                    {job.selectedFreelancer.user.walletAddress ||
                      "Wallet not connected"}
                  </p>

                </div>

              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4">

                <p className="text-sm text-neutral-500">
                  No freelancer has been selected for this project yet.
                </p>

              </div>
            )}

          </section>

          {/* =====================================================
              ESCROW MILESTONES
          ===================================================== */}

          <section className="mb-6">

            <div className="mb-5 flex items-end justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-red-500" />

                  <h2 className="text-xl font-bold tracking-tight text-neutral-950">
                    Escrow Milestones
                  </h2>

                </div>

                <p className="mt-1 text-xs text-neutral-500">
                  Track funding, escrow and payment activity.
                </p>

              </div>

            </div>

            {job.milestones.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-14 text-center shadow-sm">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-400">
                  —
                </div>

                <h3 className="mt-5 text-lg font-semibold text-neutral-950">
                  No milestones yet
                </h3>

                <p className="mt-2 text-sm text-neutral-500">
                  No milestones have been created for this project.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {job.milestones.map((milestone) => (

                  <article
                    key={milestone.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md sm:p-6"
                  >

                    {/* Milestone Header */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>

                        <div className="mb-2 flex items-center gap-2">

                          <span className="h-2 w-2 rounded-full bg-red-500" />

                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            Milestone
                          </span>

                        </div>

                        <h3 className="text-lg font-bold text-neutral-950">
                          {milestone.title}
                        </h3>

                        <p className="mt-2 text-sm font-semibold text-neutral-800">
                          {milestone.amount} ETH
                        </p>

                      </div>

                      <span className="w-fit rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                        {milestone.status}
                      </span>

                    </div>

                    {/* Escrow */}

                    {milestone.escrow ? (

                      <div className="mt-5 border-t border-neutral-100 pt-5">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div>

                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                              Escrow Status
                            </p>

                            <p className="mt-1 text-sm font-semibold text-neutral-950">
                              {milestone.escrow.status}
                            </p>

                          </div>

                          <span className="w-fit rounded-full bg-neutral-950 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                            Active Escrow
                          </span>

                        </div>

                        <div className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4">

                          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                            Transaction History
                          </p>

                          <TransactionHistory
                            escrowId={milestone.escrow.id}
                          />

                        </div>

                      </div>

                    ) : (

                      <div className="mt-5 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-neutral-400 shadow-sm">
                            —
                          </div>

                          <div>

                            <p className="text-sm font-medium text-neutral-700">
                              Escrow not created
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Escrow has not been created for this
                              milestone yet.
                            </p>

                          </div>

                        </div>

                      </div>

                    )}

                  </article>

                ))}

              </div>

            )}

          </section>

          {/* =====================================================
              SUMMARY
          ===================================================== */}

          <section className="grid gap-3 sm:grid-cols-3">

            {/* Total Milestones */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Total Milestones
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                {job.milestones.length}
              </p>

            </div>

            {/* Funded */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Funded / Active
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                {fundedMilestones.length}
              </p>

            </div>

            {/* Total Value */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Total Project Value
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                {totalProjectValue} ETH
              </p>

            </div>

          </section>

        </div>
      </main>
    </>
  );
}