import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";
import TransactionHistory from "@/components/escrow/TransactionHistory";

export default async function EscrowPage({
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

    const clientProfile = await prisma.clientProfile.findUnique({
        where: {
            userId: session.user.id,
        },
    });

    if (!clientProfile) {
        redirect("/client/profile");
    }

    const job = await prisma.job.findFirst({
        where: {
            id: jobId,
            clientId: clientProfile.id,
        },
        include: {
            selectedFreelancer: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
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

    const fundedMilestones = job.milestones.filter(
        (milestone) =>
            milestone.status === "FUNDED" ||
            milestone.status === "SUBMITTED" ||
            milestone.status === "APPROVED"
    );

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-slate-950 px-6 py-10">
                <div className="mx-auto max-w-6xl space-y-8">

                    {/* Header */}
                    <div>
                        <p className="text-sm text-indigo-400">
                            Escrow
                        </p>

                        <h1 className="mt-2 text-4xl font-bold text-white">
                            {job.title}
                        </h1>

                        <p className="mt-2 text-slate-400">
                            Manage milestone funding and payment history.
                        </p>
                    </div>

                    {/* Freelancer */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="text-xl font-semibold text-white">
                            Selected Freelancer
                        </h2>

                        {job.selectedFreelancer ? (
                            <div className="mt-4 space-y-2">
                                <p className="text-white">
                                    {job.selectedFreelancer.user.name}
                                </p>

                                <p className="text-sm text-slate-400">
                                    {job.selectedFreelancer.user.email}
                                </p>

                                <p className="break-all text-sm text-slate-500">
                                    Wallet:{" "}
                                    {job.selectedFreelancer.user.walletAddress ||
                                        "Wallet not connected"}
                                </p>
                            </div>
                        ) : (
                            <p className="mt-4 text-slate-400">
                                No freelancer selected yet.
                            </p>
                        )}
                    </div>

                    {/* Milestones */}
                    <div>
                        <h2 className="mb-5 text-2xl font-semibold text-white">
                            Escrow Milestones
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
                                    <div
                                        key={milestone.id}
                                        className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                                    >
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">
                                                    {milestone.title}
                                                </h3>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    {milestone.amount} ETH
                                                </p>
                                            </div>

                                            <span className="w-fit rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
                                                {milestone.status}
                                            </span>
                                        </div>

                                        {milestone.escrow && (
                                            <div className="mt-5 border-t border-slate-800 pt-5">
                                                <p className="text-sm text-slate-400">
                                                    Escrow Status
                                                </p>

                                                <p className="mt-1 font-medium text-white">
                                                    {milestone.escrow.status}
                                                </p>

                                                <div className="mt-4">
                                                    <TransactionHistory
                                                        escrowId={
                                                            milestone.escrow.id
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {!milestone.escrow && (
                                            <p className="mt-5 text-sm text-slate-500">
                                                Escrow has not been created yet.
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="grid gap-5 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                            <p className="text-sm text-slate-400">
                                Total Milestones
                            </p>

                            <p className="mt-2 text-3xl font-bold text-white">
                                {job.milestones.length}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                            <p className="text-sm text-slate-400">
                                Funded / Active
                            </p>

                            <p className="mt-2 text-3xl font-bold text-white">
                                {fundedMilestones.length}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                            <p className="text-sm text-slate-400">
                                Total Project Value
                            </p>

                            <p className="mt-2 text-3xl font-bold text-white">
                                {job.milestones.reduce(
                                    (total, milestone) =>
                                        total + milestone.amount,
                                    0
                                )}{" "}
                                ETH
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}