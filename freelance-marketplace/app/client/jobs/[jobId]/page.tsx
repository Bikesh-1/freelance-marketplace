import MilestoneList from "@/components/milestone/MilestoneList";
import Link from "next/link";

export default async function ClientJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  return (
    <main className="min-h-screen bg-slate-950 p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Job Dashboard
          </h1>
          <p className="text-slate-400 mt-2">
            Manage milestones and escrow payments
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
    <Link
        href={`/client/jobs/${jobId}/applications`}
        className="rounded-xl border border-slate-800 bg-slate-900 p-5"
    >
        <h2 className="font-semibold text-white">
            Applications
        </h2>

        <p className="mt-2 text-sm text-slate-400">
            Review freelancer proposals
        </p>
    </Link>

    <Link
        href={`/client/jobs/${jobId}/milestones`}
        className="rounded-xl border border-slate-800 bg-slate-900 p-5"
    >
        <h2 className="font-semibold text-white">
            Milestones
        </h2>

        <p className="mt-2 text-sm text-slate-400">
            Manage project milestones
        </p>
    </Link>

    <Link
        href={`/client/jobs/${jobId}/escrow`}
        className="rounded-xl border border-slate-800 bg-slate-900 p-5"
    >
        <h2 className="font-semibold text-white">
            Escrow
        </h2>

        <p className="mt-2 text-sm text-slate-400">
            Manage project payments
        </p>
    </Link>
</div>
      </div>
    </main>
  );
}