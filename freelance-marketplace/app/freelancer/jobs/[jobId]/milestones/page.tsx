import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";
import FreelancerMilestoneCard from "@/components/milestone/FreelancerMilestoneCard";
import Loginnavbar from "@/components/layout/loginNavbar";

export default async function FreelancerMilestonesPage({
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
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <section className="mb-8">

            <div className="mb-3 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-red-500" />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Project Workspace
              </span>

            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                  Project Milestones
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                  Submit completed work and keep track of your
                  milestone progress.
                </p>

              </div>

              <div className="w-fit rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-500 shadow-sm">
                {job.milestones.length}{" "}
                {job.milestones.length === 1
                  ? "Milestone"
                  : "Milestones"}
              </div>

            </div>

          </section>

          {/* =====================================================
              MILESTONE SUMMARY
          ===================================================== */}

          {job.milestones.length > 0 && (
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

              {/* Pending */}

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                  {
                    job.milestones.filter(
                      (milestone) =>
                        milestone.status === "PENDING"
                    ).length
                  }
                </p>

              </div>

              {/* Other */}

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Project Status
                </p>

                <p className="mt-2 text-lg font-bold tracking-tight text-neutral-950">
                  Active
                </p>

              </div>

            </section>
          )}

          {/* =====================================================
              NO MILESTONES
          ===================================================== */}

          {job.milestones.length === 0 ? (

            <section className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-400">
                —
              </div>

              <h2 className="mt-5 text-lg font-semibold text-neutral-950">
                No milestones yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Your client has not created any milestones for this
                project yet.
              </p>

            </section>

          ) : (

            /* =====================================================
               MILESTONES
            ===================================================== */

            <div className="space-y-5">

              {job.milestones.map((milestone) => (

                <div
                  key={milestone.id}
                  className="space-y-3"
                >

                  {/* =================================================
                      MILESTONE CARD
                  ================================================= */}

                  <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:shadow-md">

                    <FreelancerMilestoneCard
                      milestone={milestone}
                    />

                  </div>

                  {/* =================================================
                      PENDING MESSAGE
                  ================================================= */}

                  {milestone.status === "PENDING" && (

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

                      <div className="flex items-start gap-4">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-amber-600 shadow-sm">
                          !
                        </div>

                        <div className="min-w-0">

                          <h3 className="text-sm font-semibold text-amber-900">
                            Waiting for Client Funding
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-amber-700">
                            This milestone has not been funded yet.
                            You will be able to submit your work once
                            the client funds this milestone.
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">

                            <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                              PENDING
                            </span>

                            <span className="text-[10px] font-medium text-amber-600">
                              Waiting for client action
                            </span>

                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                </div>

              ))}

            </div>

          )}

        </div>
      </main>
    </>
  );
}