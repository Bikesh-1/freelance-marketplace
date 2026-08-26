import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/navbar";

export default async function ClientJobsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "CLIENT") {
    redirect("/login");
  }

  const profile = await prisma.clientProfile.findUnique({
    where: {
      userId: (session.user as any).id,
    },
  });

  if (!profile) {
    redirect("/client/profile");
  }

  const jobs = await prisma.job.findMany({
    where: {
      clientId: profile.id,
    },
    include: {
      applications: true,
      milestones: true,
      escrow: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-red-500" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Client Workspace
                </span>

              </div>

              <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                My Jobs
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                Manage your posted projects, applications,
                milestones and escrow.
              </p>
            </div>

            <Link
              href="/client/jobs/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-400"
            >
              <span className="text-lg leading-none">
                +
              </span>
              Create Job
            </Link>

          </div>

          {/* =====================================================
              SUMMARY
          ===================================================== */}

          {jobs.length > 0 && (
            <div className="mb-6 grid gap-3 sm:grid-cols-3">

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Total Jobs
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {jobs.length}
                </p>

              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Applications
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {jobs.reduce(
                    (total, job) =>
                      total + job.applications.length,
                    0
                  )}
                </p>

              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Milestones
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {jobs.reduce(
                    (total, job) =>
                      total + job.milestones.length,
                    0
                  )}
                </p>

              </div>

            </div>
          )}

          {/* =====================================================
              EMPTY STATE
          ===================================================== */}

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-400">
                +
              </div>

              <h2 className="mt-5 text-xl font-semibold text-neutral-950">
                No jobs posted yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Create your first freelance job and start
                receiving applications from talented freelancers.
              </p>

              <Link
                href="/client/jobs/create"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Post Your First Job
              </Link>

            </div>
          ) : (
            <div className="space-y-5">

              {jobs.map((job) => (

                <div
                  key={job.id}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:shadow-md"
                >

                  {/* =================================================
                      JOB HEADER
                  ================================================= */}

                  <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                            {job.jobType}
                          </span>

                          <span className="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-green-600">
                            {job.status}
                          </span>

                        </div>

                        <h2 className="mt-3 text-xl font-bold tracking-tight text-neutral-950 sm:text-2xl">
                          {job.title}
                        </h2>

                        <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-neutral-500">
                          {job.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">

                          <span className="rounded-lg bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600 ring-1 ring-neutral-100">
                            Budget: ${job.budget}
                          </span>

                          <span className="rounded-lg bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600 ring-1 ring-neutral-100">
                            {job.applications.length}{" "}
                            {job.applications.length === 1
                              ? "Application"
                              : "Applications"}
                          </span>

                          <span className="rounded-lg bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600 ring-1 ring-neutral-100">
                            {job.milestones.length}{" "}
                            {job.milestones.length === 1
                              ? "Milestone"
                              : "Milestones"}
                          </span>

                        </div>

                      </div>

                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:w-auto lg:w-64">

                        <Link
                          href={`/jobs/${job.id}`}
                          className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-center text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                        >
                          View
                        </Link>

                        <Link
                          href={`/client/jobs/${job.id}`}
                          className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-center text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                        >
                          Edit
                        </Link>

                        <Link
                          href={`/client/jobs/${job.id}/applications`}
                          className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-center text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                        >
                          Applications
                        </Link>

                        <Link
                          href={`/client/jobs/${job.id}/milestones`}
                          className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-center text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                        >
                          Milestones
                        </Link>

                        <Link
                          href={`/client/jobs/${job.id}/escrow`}
                          className="col-span-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-neutral-800"
                        >
                          Manage Escrow →
                        </Link>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      STATS
                  ================================================= */}

                  <div className="grid border-t border-neutral-100 sm:grid-cols-3">

                    <div className="border-b border-neutral-100 p-5 sm:border-b-0 sm:border-r">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Applications
                      </p>

                      <p className="mt-2 text-2xl font-bold text-neutral-950">
                        {job.applications.length}
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        Freelancer proposals
                      </p>

                    </div>

                    <div className="border-b border-neutral-100 p-5 sm:border-b-0 sm:border-r">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Milestones
                      </p>

                      <p className="mt-2 text-2xl font-bold text-neutral-950">
                        {job.milestones.length}
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        Project stages
                      </p>

                    </div>

                    <div className="p-5">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Escrow
                      </p>

                      <p className="mt-2 text-lg font-bold text-neutral-950">
                        {job.escrow
                          ? "Created"
                          : "Not Created"}
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          job.escrow
                            ? "text-green-600"
                            : "text-neutral-400"
                        }`}
                      >
                        {job.escrow
                          ? "Payment protection active"
                          : "Awaiting setup"}
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>
          )}

        </div>
      </main>
    </>
  );
}