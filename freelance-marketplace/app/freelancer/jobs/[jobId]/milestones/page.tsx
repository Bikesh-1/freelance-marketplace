import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";

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
            <Navbar />

            <main className="min-h-screen bg-slate-950 px-6 py-10">
                <div className="mx-auto max-w-5xl space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white">
                            Project Milestones
                        </h1>

                        <p className="mt-2 text-slate-400">
                            Submit your completed work and track milestone status.
                        </p>
                    </div>

                    {job.milestones.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                            <h2 className="text-xl font-semibold text-white">
                                No milestones yet
                            </h2>

                            <p className="mt-2 text-sm text-slate-400">
                                Your client has not created any milestones.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {job.milestones.map((milestone) => (
                                <FreelancerMilestoneCard
                                    key={milestone.id}
                                    milestone={milestone}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}