import { getDisputes } from "@/services/dispute.service";

export default async function AdminDisputesPage() {
  const disputes =
    await getDisputes();

  return (
    <main className="min-h-screen bg-slate-950 p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-4xl font-bold text-white">
          Dispute Center
        </h1>

        {disputes.map(
          (dispute: any) => (
            <div
              key={dispute.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3"
            >
              <h3 className="text-xl font-semibold text-white">
                {
                  dispute.milestone
                    .title
                }
              </h3>

              <p className="text-slate-400">
                {dispute.reason}
              </p>

              <p className="text-slate-300">
                Status:
                {dispute.status}
              </p>

              <button className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500">
                Refund Client
              </button>
            </div>
          )
        )}
      </div>
    </main>
  );
}