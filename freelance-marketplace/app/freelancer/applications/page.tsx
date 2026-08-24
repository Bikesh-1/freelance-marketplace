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

            <main className="min-h-screen bg-slate-950 px-6 py-10">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white">
                            My Applications
                        </h1>

                        <p className="mt-2 text-slate-400">
                            Track all the jobs you have applied for.
                        </p>
                    </div>

                    {applications.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                            <h2 className="text-xl font-semibold text-white">
                                No applications yet
                            </h2>

                            <p className="mt-2 text-sm text-slate-400">
                                Browse available jobs and submit your first proposal.
                            </p>

                            <Link
                                href="/jobs"
                                className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
                            >
                                Browse Jobs
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map((application) => (
                                <div
                                    key={application.id}
                                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                                >
                                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
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
                                                Proposed Budget: $
                                                {application.proposedBudget}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Applied on{" "}
                                                {new Date(
                                                    application.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200">
                                                {application.status}
                                            </span>

                                            <Link
                                                href={`/jobs/${application.job.id}`}
                                                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-white hover:border-slate-600 hover:bg-slate-800"
                                            >
                                                View Job
                                            </Link>
                                        </div>
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