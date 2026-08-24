import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";

export default async function CompletedJobsPage() {
    const session =
        await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    if (session.user.role !== "FREELANCER") {
        redirect("/login");
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

    const jobs =
        await prisma.job.findMany({
            where: {
                selectedFreelancerId:
                    profile.id,
                status: "COMPLETED",
            },
            include: {
                client: true,
                milestones: {
                    where: {
                        status: "RELEASED",
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

    const totalEarnings =
        jobs.reduce(
            (total, job) =>
                total +
                job.milestones.reduce(
                    (sum, milestone) =>
                        sum + milestone.amount,
                    0
                ),
            0
        );

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-slate-950 px-6 py-10">
                <div className="mx-auto max-w-6xl space-y-8">

                    <div>
                        <h1 className="text-4xl font-bold text-white">
                            Completed Jobs
                        </h1>

                        <p className="mt-2 text-slate-400">
                            Your completed projects and released earnings.
                        </p>
                    </div>

                    {/* Earnings */}
                    <div className="rounded-2xl border border-green-800 bg-green-950/20 p-6">
                        <p className="text-sm text-green-400">
                            Total Released Earnings
                        </p>

                        <h2 className="mt-2 text-4xl font-bold text-white">
                            {totalEarnings.toFixed(4)} ETH
                        </h2>
                    </div>

                    {/* Jobs */}
                    {jobs.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                            <p className="text-slate-400">
                                No completed jobs yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map((job) => {
                                const earned =
                                    job.milestones.reduce(
                                        (sum, milestone) =>
                                            sum +
                                            milestone.amount,
                                        0
                                    );

                                return (
                                    <div
                                        key={job.id}
                                        className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                                    >
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <Link
                                                    href={`/freelancer/jobs/${job.id}`}
                                                    className="text-xl font-semibold text-white hover:text-indigo-400"
                                                >
                                                    {job.title}
                                                </Link>

                                                <p className="mt-2 text-sm text-slate-400">
                                                    Client:{" "}
                                                    {job.client.companyName}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Completed:{" "}
                                                    {new Date(
                                                        job.updatedAt
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="text-left md:text-right">
                                                <p className="text-sm text-slate-400">
                                                    Earned
                                                </p>

                                                <p className="mt-1 text-xl font-bold text-green-400">
                                                    {earned.toFixed(
                                                        4
                                                    )}{" "}
                                                    ETH
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}