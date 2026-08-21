import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import ConversationList from "@/components/chat/ConversationList";

export default async function MessagesPage() {
const session = await getServerSession(authOptions);

if (!session || !session.user) {
redirect("/login");
}

const userId = (session.user as any).id;
const role = (session.user as any).role;

let conversations: any[] = [];

if (role === "CLIENT") {
const clientProfile = await prisma.clientProfile.findUnique({
where: { userId },
});

if (clientProfile) {
  conversations = await prisma.job.findMany({
    where: {
      clientId: clientProfile.id,
      messages: {
        some: {},
      },
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}


} else if (role === "FREELANCER") {
const freelancerProfile = await prisma.freelancerProfile.findUnique({where: { userId },
});

if (freelancerProfile) {
  conversations = await prisma.job.findMany({
    where: {
      selectedFreelancerId: freelancerProfile.id,
      messages: {
        some: {},
      },
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}


}

return (
<> <Navbar />

  <main className="min-h-screen bg-slate-950 px-6 py-10">
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Messages</h1>

          <p className="mt-2 text-slate-400">
            Chat with clients and freelancers about your jobs and milestones.
          </p>
        </div>

        <Link
          href="/jobs"
          className="rounded-xl border border-slate-700 px-4 py-2 text-white hover:border-slate-600"
        >
          Browse Jobs
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-4">
            <h2 className="text-lg font-semibold text-white">
              Conversations
            </h2>
          </div>

          <div className="p-4">
            <ConversationList conversations={conversations} />
          </div>
        </aside>

        <section className="rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-4">
            <h2 className="text-lg font-semibold text-white">
              Conversation
            </h2>
          </div>

          <div className="flex min-h-[520px] items-center justify-center p-8">
            <div className="max-w-md text-center">
              <h3 className="text-xl font-semibold text-white">
                Select a conversation
              </h3>

              <p className="mt-3 text-slate-400">
                Choose a conversation from the left panel to open the job
                chat.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</>

);
}
