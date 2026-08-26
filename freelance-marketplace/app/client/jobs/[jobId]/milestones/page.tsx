import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import Navbar from "@/components/layout/navbar";
import CreateMilestoneForm from "@/components/milestone/CreateMilestoneForm";
import MilestoneCard from "@/components/milestone/MilestoneCard";

export default async function ClientMilestonesPage({
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

  const profile = await prisma.clientProfile.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!profile) {
    redirect("/client/profile");
  }

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      clientId: profile.id,
    },

    include: {
      selectedFreelancer: {
        select: {
          user: {
            select: {
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
                Client Project
              </span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                  {job.title}
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                  Create, fund and manage project milestones from
                  one place.
                </p>

              </div>

              <span className="w-fit rounded-full border border-neutral-200 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-600 shadow-sm">
                Milestones
              </span>

            </div>

          </section>

          {/* =====================================================
              CREATE MILESTONE
          ===================================================== */}

          <section className="mb-8">

            <div className="mb-4 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-red-500" />

              <div>

                <h2 className="text-lg font-bold tracking-tight text-neutral-950">
                  Create Milestone
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  Break your project into clear payment stages.
                </p>

              </div>

            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">

              <CreateMilestoneForm
                jobId={job.id}
              />

            </div>

          </section>

          {/* =====================================================
              PROJECT MILESTONES
          ===================================================== */}

          <section>

            <div className="mb-5 flex items-end justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-red-500" />

                  <h2 className="text-xl font-bold tracking-tight text-neutral-950">
                    Project Milestones
                  </h2>

                </div>

                <p className="mt-1 text-xs text-neutral-500">
                  Track milestone progress, funding and payments.
                </p>

              </div>

              <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-neutral-500 shadow-sm ring-1 ring-neutral-200">
                {job.milestones.length}{" "}
                {job.milestones.length === 1
                  ? "Milestone"
                  : "Milestones"}
              </span>

            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {job.milestones.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-14 text-center shadow-sm">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-400">
                  —
                </div>

                <h3 className="mt-5 text-lg font-semibold text-neutral-950">
                  No milestones yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                  Create your first milestone above to start
                  managing the project.
                </p>

              </div>

            ) : (

              /* =================================================
                 MILESTONE LIST
              ================================================= */

              <div className="space-y-4">

                {job.milestones.map((milestone) => (

                  <div
                    key={milestone.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
                  >

                    <MilestoneCard
                      milestone={milestone}
                      freelancerAddress={
                        job.selectedFreelancer?.user
                          .walletAddress
                      }
                    />

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>
      </main>
    </>
  );
}