import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "CLIENT") {
    redirect("/freelancer/dashboard");
  }

  const profile = await prisma.clientProfile.findUnique({
    where: {
      userId: (session.user as any).id,
    },
  });

  if (!profile) {
    redirect("/client/profile");
  }

  if (!profile.isProfileCompleted) {
    redirect("/client/profile");
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">
          Client Dashboard
        </h1>

        <p className="text-slate-400 mb-10">
          Welcome, {profile.companyName}
        </p>
        <div className="p-10">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              Client Dashboard
            </h1>

            <ConnectWalletButton />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-xl font-semibold mb-2">
              Post a Job
            </h3>

            <p className="text-slate-400 mb-4">
              Create a new freelance job.
            </p>

            <Button>Create Job</Button>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold mb-2">
              My Jobs
            </h3>

            <p className="text-slate-400 mb-4">
              Manage posted jobs.
            </p>

            <Button variant="outline">
              Manage Jobs
            </Button>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold mb-2">
              AI Freelancer Match
            </h3>

            <p className="text-slate-400 mb-4">
              Get AI recommended freelancers.
            </p>

            <Button variant="outline">
              View Recommendations
            </Button>
          </Card>
        </div>
      </main>
    </>
  );
}