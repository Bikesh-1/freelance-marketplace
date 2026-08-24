import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";

export default async function FreelancerJobPage({
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
            client: true,
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
                <div className="mx-auto max-w-6xl space-y-8">

                    {/* Header */}
                    <div>
                        <Link
                            href="/freelancer/dashboard"
                            className="text-sm text-slate-400 hover:text-white"
                        >
                            ← Back to Dashboard
                        </Link>

                        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-white">
                                    {job.title}
                                </h1>

                                <p className="mt-2 text-slate-400">
                                    Active project with{" "}
                                    {job.client.companyName}
                                </p>
                            </div>

                            <span className="w-fit rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400">
                                {job.status}
                            </span>
                        </div>
                    </div>

                    {/* Job Information */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                            <p className="text-sm text-slate-400">
                                Budget
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-white">
                                ${job.budget}
                            </h2>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                            <p className="text-sm text-slate-400">
                                Job Type
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-white">
                                {job.jobType}
                            </h2>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                            <p className="text-sm text-slate-400">
                                Milestones
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-white">
                                {job.milestones.length}
                            </h2>
                        </div>
                    </div>

                    {/* Job Description */}
                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="text-xl font-semibold text-white">
                            Project Details
                        </h2>

                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                            {job.description}
                        </p>
                    </section>

                    {/* Actions */}
                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="text-xl font-semibold text-white">
                            Project Management
                        </h2>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <Link
                                href={`/freelancer/jobs/${job.id}/milestones`}
                                className="rounded-xl bg-indigo-600 p-5 hover:bg-indigo-500"
                            >
                                <h3 className="font-semibold text-white">
                                    Milestones
                                </h3>

                                <p className="mt-2 text-sm text-indigo-100">
                                    View and submit milestone work.
                                </p>
                            </Link>

                            <Link
                                href={`/jobs/${job.id}`}
                                className="rounded-xl border border-slate-700 p-5 hover:border-slate-600 hover:bg-slate-800"
                            >
                                <h3 className="font-semibold text-white">
                                    Job Details
                                </h3>

                                <p className="mt-2 text-sm text-slate-400">
                                    View the original job details.
                                </p>
                            </Link>

                            <Link
                                href={`/messages/${job.id}`}
                                className="rounded-xl border border-slate-700 p-5 hover:border-slate-600 hover:bg-slate-800"
                            >
                                <h3 className="font-semibold text-white">
                                    Message Client
                                </h3>

                                <p className="mt-2 text-sm text-slate-400">
                                    Communicate with your client.
                                </p>
                            </Link>
                        </div>
                    </section>

                    {/* Milestone Summary */}
                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Milestone Progress
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Track your project milestones.
                                </p>
                            </div>

                            <Link
                                href={`/freelancer/jobs/${job.id}/milestones`}
                                className="text-sm text-indigo-400 hover:text-indigo-300"
                            >
                                View All
                            </Link>
                        </div>

                        {job.milestones.length === 0 ? (
                            <div className="mt-5 rounded-xl border border-slate-800 p-6 text-center">
                                <p className="text-sm text-slate-400">
                                    No milestones created yet.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-5 space-y-3">
                                {job.milestones.map((milestone) => (
                                    <div
                                        key={milestone.id}
                                        className="flex flex-col gap-3 rounded-xl border border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <h3 className="font-medium text-white">
                                                {milestone.title}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-400">
                                                ${milestone.amount}
                                            </p>
                                        </div>

                                        <span className="w-fit rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                                            {milestone.status}
                                        </span>
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