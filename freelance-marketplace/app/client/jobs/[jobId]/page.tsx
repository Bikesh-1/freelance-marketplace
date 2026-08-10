import MilestoneList from "@/components/milestone/MilestoneList";

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

        <MilestoneList jobId={jobId} />
      </div>
    </main>
  );
}