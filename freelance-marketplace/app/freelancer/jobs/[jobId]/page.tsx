import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";
import Loginnavbar from "@/components/layout/loginNavbar";

export default async function FreelancerJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user) {
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

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      selectedFreelancerId: profile.id,
    },
    include: {
      client: true,
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

  return (
    <>
      

      <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">
        <Loginnavbar/>
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

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />

                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Active Project
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                  {job.title}
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                  Working with{" "}
                  <span className="font-medium text-neutral-700">
                    {job.client.companyName}
                  </span>
                </p>
              </div>

              <span className="w-fit shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 shadow-sm">
                {job.status}
              </span>
            </div>
          </section>

          {/* =====================================================
              PROJECT STATS
          ===================================================== */}

          <section className="mb-6 grid gap-3 sm:grid-cols-3">

            {/* Budget */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Project Budget
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                    ${job.budget}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-sm font-bold text-red-500">
                  $
                </div>
              </div>
            </div>

            {/* Job Type */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Job Type
                  </p>

                  <p className="mt-2 text-xl font-bold tracking-tight text-neutral-950">
                    {job.jobType}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-500">
                  ◷
                </div>
              </div>
            </div>

            {/* Milestones */}

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Milestones
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                    {job.milestones.length}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-500">
                  ✓
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              MAIN CONTENT
          ===================================================== */}

          <div className="grid items-start gap-6 lg:grid-cols-3">

            {/* =================================================
                LEFT CONTENT
            ================================================= */}

            <div className="space-y-6 lg:col-span-2">

              {/* Project Details */}

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />

                  <div>
                    <h2 className="text-base font-semibold text-neutral-950">
                      Project Details
                    </h2>

                    <p className="mt-1 text-xs text-neutral-500">
                      Review the requirements and project scope.
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-neutral-100 pt-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-neutral-600">
                    {job.description}
                  </p>
                </div>
              </section>

              {/* =================================================
                  MILESTONE PROGRESS
              ================================================= */}

              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />

                      <h2 className="text-base font-semibold text-neutral-950">
                        Milestone Progress
                      </h2>
                    </div>

                    <p className="mt-1 text-xs text-neutral-500">
                      Track your project milestones and their current
                      status.
                    </p>
                  </div>

                  <Link
                    href={`/freelancer/jobs/${job.id}/milestones`}
                    className="shrink-0 text-xs font-semibold text-neutral-500 transition hover:text-red-500"
                  >
                    View All →
                  </Link>
                </div>

                {job.milestones.length === 0 ? (
                  <div className="mt-5 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-5 py-8 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm">
                      —
                    </div>

                    <p className="mt-3 text-sm font-medium text-neutral-700">
                      No milestones yet
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      Milestones created for this project will appear
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {job.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition hover:border-neutral-200 hover:bg-white"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-neutral-900">
                              {milestone.title}
                            </h3>

                            <p className="mt-1 text-xs text-neutral-500">
                              ${milestone.amount}
                            </p>
                          </div>

                          {/* Status — ONLY STYLING CHANGED */}

                          <span className="w-fit rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                            {milestone.status}
                          </span>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* =================================================
                RIGHT — PROJECT MANAGEMENT
            ================================================= */}

            <aside className="lg:sticky lg:top-6">
              <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">

                {/* Header */}

                <div className="border-b border-neutral-100 bg-neutral-950 p-5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    Project Workspace
                  </p>

                  <h2 className="mt-1 text-lg font-bold">
                    Manage Project
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    Access milestones, job details and client
                    communication.
                  </p>
                </div>

                {/* Actions */}

                <div className="space-y-3 p-4">

                  {/* Milestones */}

                  <Link
                    href={`/freelancer/jobs/${job.id}/milestones`}
                    className="group block rounded-xl bg-red-500 p-4 transition hover:bg-red-400"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Milestones
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-red-100">
                          View and submit milestone work.
                        </p>
                      </div>

                      <span className="text-white transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </Link>

                  {/* Job Details */}

                  <Link
                    href={`/jobs/${job.id}`}
                    className="group block rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:bg-neutral-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900">
                          Job Details
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          View the original job posting.
                        </p>
                      </div>

                      <span className="text-neutral-400 transition group-hover:translate-x-1 group-hover:text-red-500">
                        →
                      </span>
                    </div>
                  </Link>

                  {/* Message Client */}

                  <Link
                    href={`/messages/${job.id}`}
                    className="group block rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:bg-neutral-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900">
                          Message Client
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          Communicate with your client.
                        </p>
                      </div>

                      <span className="text-neutral-400 transition group-hover:translate-x-1 group-hover:text-red-500">
                        →
                      </span>
                    </div>
                  </Link>

                </div>
              </section>
            </aside>

          </div>
        </div>
      </main>
    </>
  );
}