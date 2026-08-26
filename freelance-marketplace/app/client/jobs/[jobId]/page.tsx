import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import CompleteJobButton from "@/components/jobs/CompleteJobButton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";

export default async function ClientMilestonesPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "CLIENT") {
    redirect("/login");
  }

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,

      client: {
        userId: session.user.id,
      },
    },
    include: {
      milestones: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!job) {
    notFound();
  }

  const allMilestonesReleased =
    job.milestones.length > 0 &&
    job.milestones.every(
      (milestone) => milestone.status === "RELEASED"
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
                Client Workspace
              </span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                  Project Milestones
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                  Review submitted work, manage milestone progress and
                  complete your project.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">

                <Link
                  href={`/messages/${jobId}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:text-red-500"
                >
                  Messages
                  <span>→</span>
                </Link>

                <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-600 shadow-sm">
                  {job.status}
                </span>

              </div>

            </div>

          </section>

          {/* =====================================================
              PROJECT SUMMARY
          ===================================================== */}

          <section className="mb-6 grid gap-3 sm:grid-cols-3">

            {/* Total */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Total Milestones
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                {job.milestones.length}
              </p>

            </div>

            {/* Submitted */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Awaiting Review
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                {
                  job.milestones.filter(
                    (milestone) =>
                      milestone.status === "SUBMITTED"
                  ).length
                }
              </p>

            </div>

            {/* Released */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Released
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                {
                  job.milestones.filter(
                    (milestone) =>
                      milestone.status === "RELEASED"
                  ).length
                }
              </p>

            </div>

          </section>

          {/* =====================================================
              MILESTONES
          ===================================================== */}

          {job.milestones.length === 0 ? (

            <section className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-400">
                —
              </div>

              <h2 className="mt-5 text-lg font-semibold text-neutral-950">
                No milestones created yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                There are currently no milestones associated with
                this project.
              </p>

            </section>

          ) : (

            <section className="space-y-4">

              {job.milestones.map((milestone) => (

                <article
                  key={milestone.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300 hover:shadow-md sm:p-6"
                >

                  {/* =================================================
                      MILESTONE HEADER
                  ================================================= */}

                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                    <div className="min-w-0">

                      <div className="mb-2 flex items-center gap-2">

                        <span className="h-2 w-2 rounded-full bg-red-500" />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                          Milestone
                        </span>

                      </div>

                      <h2 className="text-lg font-bold tracking-tight text-neutral-950">
                        {milestone.title}
                      </h2>

                      {milestone.description && (
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                          {milestone.description}
                        </p>
                      )}

                      <p className="mt-3 text-sm font-semibold text-neutral-900">
                        ${milestone.amount}
                      </p>

                    </div>

                    <span className="w-fit shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                      {milestone.status}
                    </span>

                  </div>

                  {/* =================================================
                      SUBMITTED WORK
                  ================================================= */}

                  {milestone.status === "SUBMITTED" &&
                    milestone.submissionUrl && (

                      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">

                        <div className="flex items-start gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-blue-600 shadow-sm">
                            ↗
                          </div>

                          <div className="min-w-0">

                            <p className="text-sm font-semibold text-blue-950">
                              Work Submitted
                            </p>

                            <p className="mt-1 text-xs text-blue-700">
                              The freelancer has submitted work for
                              your review.
                            </p>

                          </div>

                        </div>

                        <div className="mt-4 rounded-xl border border-blue-100 bg-white p-3">

                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                            Submission URL
                          </p>

                          <a
                            href={milestone.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block break-all text-xs font-medium text-red-500 transition hover:text-red-400 hover:underline"
                          >
                            {milestone.submissionUrl}
                          </a>

                        </div>

                        {milestone.submissionNote && (
                          <div className="mt-3 rounded-xl border border-blue-100 bg-white p-3">

                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                              Freelancer Note
                            </p>

                            <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                              {milestone.submissionNote}
                            </p>

                          </div>
                        )}

                      </div>
                    )}

                  {/* =================================================
                      APPROVE
                  ================================================= */}

                  {milestone.status === "SUBMITTED" && (

                    <div className="mt-5 border-t border-neutral-100 pt-5">

                      <form
                        action={`/api/milestone/${milestone.id}/approve`}
                        method="POST"
                      >

                        <button
                          type="submit"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 sm:w-auto"
                        >
                          Approve Work
                          <span>→</span>
                        </button>

                      </form>

                    </div>
                  )}

                </article>

              ))}

            </section>

          )}

          {/* =====================================================
              PROJECT COMPLETION
          ===================================================== */}

          {job.status === "IN_PROGRESS" &&
            allMilestonesReleased && (

              <section className="mt-6 overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">

                <div className="border-l-4 border-green-500 p-6 sm:p-7">

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <div className="flex items-center gap-2">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-sm font-bold text-green-600">
                          ✓
                        </span>

                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-green-600">
                          Ready to Complete
                        </span>

                      </div>

                      <h2 className="mt-4 text-xl font-bold tracking-tight text-neutral-950">
                        Project Completed
                      </h2>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                        All milestones have been released. You can now
                        mark this project as completed.
                      </p>

                    </div>

                    <div className="shrink-0">

                      <CompleteJobButton
                        jobId={job.id}
                      />

                    </div>

                  </div>

                </div>

              </section>
            )}

        </div>
      </main>
    </>
  );
}