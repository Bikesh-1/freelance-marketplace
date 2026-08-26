import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";

export default async function CompletedJobsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "FREELANCER") {
    redirect("/login");
  }

  const profile = await prisma.freelancerProfile.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!profile) {
    redirect("/freelancer/profile");
  }

  const jobs = await prisma.job.findMany({
    where: {
      selectedFreelancerId: profile.id,
      status: "COMPLETED",
    },
    include: {
      client: true,
      milestones: {
        where: {
          status: "RELEASED",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const totalEarnings = jobs.reduce(
    (total, job) =>
      total +
      job.milestones.reduce(
        (sum, milestone) => sum + milestone.amount,
        0
      ),
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

            <Link
              href="/freelancer/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 transition hover:text-red-500"
            >
              <span>←</span>
              Back to Dashboard
            </Link>

            <div className="mt-6">

              <div className="mb-2 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-red-500" />

                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Freelancer Workspace
                </span>

              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                    Completed Jobs
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                    Review your completed projects and released
                    milestone earnings.
                  </p>

                </div>

                <div className="w-fit rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-500 shadow-sm">
                  {jobs.length}{" "}
                  {jobs.length === 1 ? "Completed Job" : "Completed Jobs"}
                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              EARNINGS CARD
          ===================================================== */}

          <section className="mb-8 overflow-hidden rounded-2xl bg-neutral-950 shadow-sm">

            <div className="p-6 sm:p-7">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                      ↗
                    </span>

                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                      Earnings Overview
                    </span>

                  </div>

                  <p className="mt-5 text-sm text-neutral-400">
                    Total Released Earnings
                  </p>

                  <h2 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {totalEarnings.toFixed(4)}{" "}
                    <span className="text-lg font-medium text-neutral-500">
                      ETH
                    </span>
                  </h2>

                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Completed Projects
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    {jobs.length}
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              JOBS
          ===================================================== */}

          {jobs.length === 0 ? (

            <section className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-400">
                ✓
              </div>

              <h2 className="mt-5 text-lg font-semibold text-neutral-950">
                No completed jobs yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Once you complete projects and your milestone payments
                are released, they will appear here.
              </p>

              <Link
                href="/jobs"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Find New Jobs
                <span>→</span>
              </Link>

            </section>

          ) : (

            <section>

              <div className="mb-4 flex items-center justify-between">

                <div>

                  <h2 className="text-base font-semibold text-neutral-950">
                    Completed Projects
                  </h2>

                  <p className="mt-1 text-xs text-neutral-500">
                    Your recently completed freelance work.
                  </p>

                </div>

              </div>

              <div className="space-y-4">

                {jobs.map((job) => {

                  const earned = job.milestones.reduce(
                    (sum, milestone) => sum + milestone.amount,
                    0
                  );

                  return (
                    <article
                      key={job.id}
                      className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-200 hover:border-neutral-300 hover:shadow-md sm:p-6"
                    >

                      {/* =================================================
                          MAIN CONTENT
                      ================================================= */}

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        {/* Job */}

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start gap-3">

                            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-sm font-semibold text-neutral-500 sm:flex">
                              ✓
                            </div>

                            <div className="min-w-0">

                              <Link
                                href={`/freelancer/jobs/${job.id}`}
                                className="block truncate text-lg font-bold tracking-tight text-neutral-950 transition hover:text-red-500 sm:text-xl"
                              >
                                {job.title}
                              </Link>

                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">

                                <span className="font-medium text-neutral-700">
                                  {job.client.companyName}
                                </span>

                                <span className="text-neutral-300">
                                  •
                                </span>

                                <span>
                                  Completed{" "}
                                  {new Date(
                                    job.updatedAt
                                  ).toLocaleDateString()}
                                </span>

                              </div>

                            </div>

                          </div>

                        </div>

                        {/* Earnings */}

                        <div className="rounded-xl border border-neutral-100 bg-neutral-50 px-5 py-4 lg:min-w-[180px] lg:text-right">

                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            Earned
                          </p>

                          <p className="mt-1 text-xl font-bold text-neutral-950">
                            {earned.toFixed(4)}
                            <span className="ml-1 text-xs font-medium text-neutral-400">
                              ETH
                            </span>
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-neutral-400 lg:justify-end">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Released
                          </div>

                        </div>

                      </div>

                      {/* =================================================
                          FOOTER
                      ================================================= */}

                      <div className="mt-5 flex flex-col gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">

                          <span>
                            {job.milestones.length}{" "}
                            {job.milestones.length === 1
                              ? "milestone"
                              : "milestones"}
                          </span>

                          <span className="text-neutral-300">
                            •
                          </span>

                          <span>
                            Payment released
                          </span>

                        </div>

                        <Link
                          href={`/freelancer/jobs/${job.id}`}
                          className="inline-flex w-fit items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:text-red-500"
                        >
                          View Project
                          <span>→</span>
                        </Link>

                      </div>

                    </article>
                  );
                })}

              </div>

            </section>

          )}

          {/* =====================================================
              BOTTOM CTA
          ===================================================== */}

          {jobs.length > 0 && (
            <div className="mt-8 flex justify-center">

              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Find More Jobs
                <span>→</span>
              </Link>

            </div>
          )}

        </div>
      </main>
    </>
  );
}