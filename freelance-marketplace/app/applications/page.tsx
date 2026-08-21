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

      <main className="min-h-screen bg-slate-950 px-6 py-10">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-8">
            <Link
              href="/freelancer/dashboard"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-4 text-4xl font-bold text-white">
              My Applications
            </h1>

            <p className="mt-2 text-slate-400">
              Track all the jobs you have applied for.
            </p>
          </div>

          {/* Applications */}
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <h2 className="text-xl font-semibold text-white">
                No Applications Yet
              </h2>

              <p className="mt-2 text-slate-400">
                You haven't applied to any jobs yet.
              </p>

              <Link
                href="/jobs"
                className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    {/* Job Info */}
                    <div>
                      <Link
                        href={`/jobs/${application.job.id}`}
                        className="text-xl font-semibold text-white hover:text-indigo-400"
                      >
                        {application.job.title}
                      </Link>

                      <p className="mt-2 text-sm text-slate-400">
                        Client:{" "}
                        {application.job.client.companyName}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Job Budget: ${application.job.budget}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Proposed Budget: $
                        {application.proposedBudget}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-medium ${
                          application.status === "PENDING"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : application.status === "ACCEPTED"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {application.status}
                      </span>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="mt-5 border-t border-slate-800 pt-5">
                    <p className="text-sm font-medium text-slate-300">
                      Cover Letter
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {application.coverLetter}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 flex flex-col gap-3 border-t border-slate-800 pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      Applied on{" "}
                      {new Date(
                        application.createdAt
                      ).toLocaleDateString()}
                    </span>

                    <Link
                      href={`/jobs/${application.job.id}`}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      View Job →
                    </Link>
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