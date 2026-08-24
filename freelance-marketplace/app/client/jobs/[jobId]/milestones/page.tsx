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

            <main className="min-h-screen bg-slate-950 px-6 py-10">
                <div className="mx-auto max-w-6xl space-y-8">

                    {/* Header */}
                    <div>
                        <p className="text-sm text-indigo-400">
                            Client Project
                        </p>

                        <h1 className="mt-2 text-4xl font-bold text-white">
                            {job.title}
                        </h1>

                        <p className="mt-2 text-slate-400">
                            Create, fund and manage project milestones.
                        </p>
                    </div>

                    {/* Create Milestone */}
                    <CreateMilestoneForm
                        jobId={job.id}
                    />

                    {/* Milestones */}
                    <section>
                        <h2 className="mb-5 text-2xl font-semibold text-white">
                            Project Milestones
                        </h2>

                        {job.milestones.length === 0 ? (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                                <p className="text-slate-400">
                                    No milestones created yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {job.milestones.map((milestone) => (
                                    <MilestoneCard
                                        key={milestone.id}
                                        milestone={milestone}
                                        freelancerAddress={
                                            job.selectedFreelancer?.user
                                                .walletAddress
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}