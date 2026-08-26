import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "FREELANCER") {
    redirect("/client/dashboard");
  }

  const profile = await prisma.freelancerProfile.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!profile) {
    redirect("/freelancer/profile");
  }

  const applications = await prisma.application.findMany({
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
  });

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
                    My Applications
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                    Track your proposals, application status and
                    submitted offers in one place.
                  </p>

                </div>

                <div className="w-fit rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-500 shadow-sm">
                  {applications.length}{" "}
                  {applications.length === 1
                    ? "Application"
                    : "Applications"}
                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              EMPTY STATE
          ===================================================== */}

          {applications.length === 0 ? (

            <section className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-400">
                ≡
              </div>

              <h2 className="mt-5 text-lg font-semibold text-neutral-950">
                No Applications Yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                You haven't applied to any jobs yet. Explore available
                projects and send your first proposal.
              </p>

              <Link
                href="/jobs"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Browse Jobs
                <span>→</span>
              </Link>

            </section>

          ) : (

            /* =====================================================
               APPLICATION LIST
            ===================================================== */

            <div className="space-y-4">

              {applications.map((application) => (

                <article
                  key={application.id}
                  className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-200 hover:border-neutral-300 hover:shadow-md sm:p-6"
                >

                  {/* =================================================
                      TOP
                  ================================================= */}

                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    {/* Job Info */}

                    <div className="min-w-0 flex-1">

                      <Link
                        href={`/jobs/${application.job.id}`}
                        className="block truncate text-lg font-bold tracking-tight text-neutral-950 transition hover:text-red-500 sm:text-xl"
                      >
                        {application.job.title}
                      </Link>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">

                        <span className="font-medium text-neutral-700">
                          {application.job.client.companyName}
                        </span>

                        <span className="text-neutral-300">
                          •
                        </span>

                        <span>
                          Applied{" "}
                          {new Date(
                            application.createdAt
                          ).toLocaleDateString()}
                        </span>

                      </div>

                    </div>

                    {/* Status */}

                    <span
                      className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                        application.status === "PENDING"
                          ? "border border-amber-100 bg-amber-50 text-amber-600"
                          : application.status === "ACCEPTED"
                            ? "border border-neutral-200 bg-neutral-950 text-white"
                            : "border border-red-100 bg-red-50 text-red-500"
                      }`}
                    >
                      {application.status}
                    </span>

                  </div>

                  {/* =================================================
                      JOB FINANCIAL INFO
                  ================================================= */}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">

                    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Job Budget
                      </p>

                      <p className="mt-1.5 text-base font-bold text-neutral-950">
                        ${application.job.budget}
                      </p>

                    </div>

                    <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Your Proposal
                      </p>

                      <p className="mt-1.5 text-base font-bold text-neutral-950">
                        ${application.proposedBudget}
                      </p>

                    </div>

                  </div>

                  {/* =================================================
                      COVER LETTER
                  ================================================= */}

                  <div className="mt-5 rounded-xl border border-neutral-100 bg-neutral-50 p-4 sm:p-5">

                    <div className="mb-3 flex items-center gap-2">

                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                      <p className="text-xs font-semibold text-neutral-800">
                        Cover Letter
                      </p>

                    </div>

                    <p className="line-clamp-4 text-sm leading-6 text-neutral-600">
                      {application.coverLetter}
                    </p>

                  </div>

                  {/* =================================================
                      FOOTER
                  ================================================= */}

                  <div className="mt-5 flex flex-col gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="text-xs text-neutral-400">

                      Applied on{" "}
                      <span className="font-medium text-neutral-600">
                        {new Date(
                          application.createdAt
                        ).toLocaleDateString()}
                      </span>

                    </div>

                    <Link
                      href={`/jobs/${application.job.id}`}
                      className="inline-flex w-fit items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-red-500"
                    >
                      View Job
                      <span>→</span>
                    </Link>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>
      </main>
    </>
  );
}