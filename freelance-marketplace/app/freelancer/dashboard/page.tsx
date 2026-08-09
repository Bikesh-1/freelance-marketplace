import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";

export default async function FreelancerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "FREELANCER") {
    redirect("/client/dashboard");
  }

  const profile = await prisma.freelancerProfile.findUnique({
    where: {
      userId: (session.user as any).id,
    },
  });

  if (!profile) {
    redirect("/freelancer/profile");
  }

  if (!profile.isProfileCompleted) {
    redirect("/freelancer/profile");
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">
          Freelancer Dashboard
        </h1>
        <div className="p-10">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              Client Dashboard
            </h1>

            <ConnectWalletButton />
          </div>
        </div>
        <p className="text-slate-400 mb-10">
          Welcome, {profile.fullName || session.user.name}
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-xl font-semibold mb-2">
              Available Jobs
            </h3>

            <p className="text-slate-400 mb-4">
              Browse jobs that match your skills.
            </p>

            <Button>View Jobs</Button>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold mb-2">
              Applications
            </h3>

            <p className="text-slate-400 mb-4">
              Track all job applications.
            </p>

            <Button variant="outline">
              My Applications
            </Button>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold mb-2">
              AI Recommendations
            </h3>

            <p className="text-slate-400 mb-4">
              Jobs recommended using AI.
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