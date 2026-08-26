import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";

export default async function FreelancerApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "FREELANCER") {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    where: {
      freelancer: {
        userId: session.user.id,
      },
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

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="mb-2 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-red-500" />

                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Freelancer Workspace
                  </span>

                </div>

                <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                  My Applications
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                  Keep track of your proposals and application status.
                </p>

              </div>

              {/* Application Count */}

              <div className="w-fit rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-500 shadow-sm">
                {applications.length}{" "}
                {applications.length === 1
                  ? "Application"
                  : "Applications"}
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
                No applications yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Browse available freelance jobs and submit your first
                proposal.
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
               APPLICATIONS
            ===================================================== */

            <div className="space-y-4">

              {applications.map((application) => (

                <article
                  key={application.id}
                  className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-200 hover:border-neutral-300 hover:shadow-md sm:p-6"
                >

                  {/* =================================================
                      MAIN ROW
                  ================================================= */}

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* Job Information */}

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

                    {/* Status + Action */}

                    <div className="flex flex-wrap items-center gap-3">

                      <span
                        className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                          application.status === "PENDING"
                            ? "border border-amber-100 bg-amber-50 text-amber-600"
                            : application.status === "ACCEPTED"
                              ? "bg-neutral-950 text-white"
                              : "border border-red-100 bg-red-50 text-red-500"
                        }`}
                      >
                        {application.status}
                      </span>

                      <Link
                        href={`/jobs/${application.job.id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:text-red-500"
                      >
                        View Job
                        <span>→</span>
                      </Link>

                    </div>

                  </div>

                  {/* =================================================
                      APPLICATION DETAILS
                  ================================================= */}

                  <div className="mt-5 grid gap-3 border-t border-neutral-100 pt-5 sm:grid-cols-2">

                    {/* Job Budget */}

                    <div className="rounded-xl bg-neutral-50 p-4">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Job Budget
                      </p>

                      <p className="mt-1.5 text-base font-bold text-neutral-950">
                        ${application.job.budget}
                      </p>

                    </div>

                    {/* Proposed Budget */}

                    <div className="rounded-xl bg-red-50/60 p-4">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Your Proposed Budget
                      </p>

                      <p className="mt-1.5 text-base font-bold text-neutral-950">
                        ${application.proposedBudget}
                      </p>

                    </div>

                  </div>

                  {/* =================================================
                      STATUS MESSAGE
                  ================================================= */}

                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">

                    <span
                      className={`h-2 w-2 rounded-full ${
                        application.status === "PENDING"
                          ? "bg-amber-400"
                          : application.status === "ACCEPTED"
                            ? "bg-green-500"
                            : "bg-red-500"
                      }`}
                    />

                    <p className="text-xs text-neutral-500">

                      {application.status === "PENDING" && (
                        <>
                          Your application is waiting for the client&apos;s
                          response.
                        </>
                      )}

                      {application.status === "ACCEPTED" && (
                        <>
                          Your application has been accepted by the client.
                        </>
                      )}

                      {application.status === "REJECTED" && (
                        <>
                          This application was not selected for the project.
                        </>
                      )}

                      {!["PENDING", "ACCEPTED", "REJECTED"].includes(
                        application.status
                      ) && (
                        <>
                          Application status: {application.status}
                        </>
                      )}

                    </p>

                  </div>

                </article>

              ))}

            </div>

          )}

          {/* =====================================================
              BOTTOM CTA
          ===================================================== */}

          {applications.length > 0 && (
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