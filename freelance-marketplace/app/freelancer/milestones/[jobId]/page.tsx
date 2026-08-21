import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";
import FreelancerMilestoneCard from "@/components/milestone/FreelancerMilestoneCard";

export default async function FreelancerMilestonesPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  const session = await getServerSession(
    authOptions
  );

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "FREELANCER") {
    redirect("/client/dashboard");
  }

  const profile =
    await prisma.freelancerProfile.findUnique({
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
      selectedFreelancerId:
        profile.id,
    },
    include: {
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
    redirect("/freelancer/dashboard");
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold text-white">
            {job.title}
          </h1>

          <p className="mt-2 text-slate-400">
            Milestones
          </p>

          <div className="mt-8 space-y-5">
            {job.milestones.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                No milestones created yet.
              </div>
            ) : (
              job.milestones.map(
                (milestone) => (
                  <FreelancerMilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                  />
                )
              )
            )}
          </div>
        </div>
      </main>
    </>
  );
}