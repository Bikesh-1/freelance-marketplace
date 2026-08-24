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

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              My Jobs
            </h1>

            <p className="mt-2 text-slate-400">
              Manage all jobs posted by your company
            </p>
          </div>

          <Link
            href="/client/jobs/create"
            className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-500"
          >
            Create Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-2xl font-semibold text-white">
              No jobs posted yet
            </h2>

            <p className="mt-2 text-slate-400">
              Create your first freelance job to start receiving applications.
            </p>

            <Link
              href="/client/jobs/create"
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-500"
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">
                      {job.title}
                    </h2>

                    <p className="mt-2 text-slate-400">
                      {job.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
                        Budget: ${job.budget}
                      </span>

                      <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
                        {job.jobType}
                      </span>

                      <span className="rounded-full bg-green-600 px-3 py-1 text-white">
                        {job.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:w-64">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-center text-sm font-medium text-white hover:border-slate-600"
                    >
                      View
                    </Link>

                    <Link
                      href={`/client/jobs/${job.id}`}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-center text-sm font-medium text-white hover:border-slate-600"
                    >
                      Edit
                    </Link>

                    <Link
                      href={`/client/jobs/${job.id}/applications`}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-center text-sm font-medium text-white hover:border-slate-600"
                    >
                      Applications
                    </Link>

                    <Link
                      href={`/client/jobs/${job.id}/milestones`}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-center text-sm font-medium text-white hover:border-slate-600">
                        Milestones
                    </Link>

                    <Link
                      href={`/client/jobs/${job.id}/escrow`}
                      className="col-span-2 rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-500">
                        Escrow
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-800 p-4">
                    <p className="text-sm text-slate-400">
                      Applications
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                      {job.applications.length}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 p-4">
                    <p className="text-sm text-slate-400">
                      Milestones
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                      {job.milestones.length}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 p-4">
                    <p className="text-sm text-slate-400">
                      Escrow
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                      {job.escrow ? "Created" : "Not Created"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}