
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import CompleteJobButton from "@/components/jobs/CompleteJobButton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";
import Link from "next/link";

export default async function ClientMilestonesPage({
    params,
}: {
    params: Promise<{ jobId: string }>;
}) {
    const { jobId } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    if (session.user.role !== "CLIENT") {
        redirect("/login");
    }

    const job = await prisma.job.findFirst({
        where: {
            id: jobId,
            
            client: {
                userId: session.user.id,
            },
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
                <div className="mx-auto max-w-6xl space-y-8">
                    <Link
                        href={`/messages/${jobId}`}
                        className="rounded-xl border border-slate-700 p-5 hover:border-slate-600 hover:bg-slate-800"
                    >
                        <h3 className="font-semibold text-white">
                            Messages
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                            Chat with your freelancer.
                        </p>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold text-white">
                            Milestones
                        </h1>

                        <p className="mt-2 text-slate-400">
                            Review and manage milestones for this project.
                        </p>
                    </div>

                    {job.milestones.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                            <p className="text-slate-400">
                                No milestones created yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {job.milestones.map((milestone) => (
                                <div
                                    key={milestone.id}
                                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h2 className="text-xl font-semibold text-white">
                                                {milestone.title}
                                            </h2>

                                            <p className="mt-1 text-sm text-slate-400">
                                                {milestone.description}
                                            </p>

                                            <p className="mt-3 font-medium text-white">
                                                ${milestone.amount}
                                            </p>
                                        </div>

                                        <span className="w-fit rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
                                            {milestone.status}
                                        </span>
                                    </div>

                                    {milestone.status === "SUBMITTED" &&
                                        milestone.submissionUrl && (
                                            <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                                                <p className="text-sm font-medium text-white">
                                                    Work Submitted
                                                </p>

                                                <a
                                                    href={milestone.submissionUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-2 block break-all text-sm text-indigo-400 hover:text-indigo-300"
                                                >
                                                    {milestone.submissionUrl}
                                                </a>

                                                {milestone.submissionNote && (
                                                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-400">
                                                        {milestone.submissionNote}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                    {milestone.status === "SUBMITTED" && (
                                        <div className="mt-5">
                                            <form
                                                action={`/api/milestone/${milestone.id}/approve`}
                                                method="POST"
                                            >
                                                <button
                                                    type="submit"
                                                    className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-500"
                                                >
                                                    Approve Work
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                    {job.status === "IN_PROGRESS" &&
                                        job.milestones.length > 0 &&
                                        job.milestones.every(
                                            (milestone) =>
                                                milestone.status === "RELEASED"
                                        ) && (
                                            <div className="rounded-2xl border border-green-800 bg-green-950/20 p-6">
                                                <h2 className="text-xl font-semibold text-white">
                                                    Project Completed
                                                </h2>

                                                <p className="mt-2 text-sm text-slate-400">
                                                    All milestones have been released.
                                                    You can now complete this project.
                                                </p>

                                                <div className="mt-5">
                                                    <CompleteJobButton
                                                        jobId={job.id}
                                                    />
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