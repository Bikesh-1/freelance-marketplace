import EscrowFlowCard from "@/components/blockchain/EscrowFlowCard";

export default async function EscrowPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  return (
    <main className="min-h-screen bg-slate-950 p-10">
      <div className="mx-auto max-w-3xl">
        <EscrowFlowCard
          jobId={jobId}
          freelancerAddress="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
          prismaEscrowId="TEMP_ESCROW_ID"
        />
      </div>
    </main>
  );
}