import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ userId: string }> };

function dateLabel(date: Date | null | undefined) {
  return date ? date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
}
function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect(session.user.role === "CLIENT" ? "/client/dashboard" : "/freelancer/dashboard");
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      clientProfile: { include: { jobs: { orderBy: { createdAt: "desc" }, take: 20, include: { milestones: { select: { id: true, status: true, amount: true } }, _count: { select: { applications: true } } } } } },
      freelancerProfile: { include: { skills: { include: { skill: true } }, portfolios: { orderBy: { createdAt: "desc" }, take: 10 }, experiences: { orderBy: { startDate: "desc" }, take: 10 }, applications: { orderBy: { createdAt: "desc" }, take: 20, include: { job: { select: { id: true, title: true, status: true, budget: true } } } }, reviews: { orderBy: { createdAt: "desc" }, take: 10, include: { client: { select: { companyName: true } } } } } },
      walletTransactions: { orderBy: { createdAt: "desc" }, take: 20 },
      notifications: { orderBy: { createdAt: "desc" }, take: 10 },
      openedDisputes: { orderBy: { createdAt: "desc" }, take: 10, include: { milestone: { include: { job: { select: { id: true, title: true } } } } } },
      sentMessages: { orderBy: { createdAt: "desc" }, take: 10, include: { job: { select: { title: true } }, receiver: { select: { name: true, email: true } } } },
      receivedMessages: { orderBy: { createdAt: "desc" }, take: 10, include: { job: { select: { title: true } }, sender: { select: { name: true, email: true } } } },
      _count: { select: { sentMessages: true, receivedMessages: true, notifications: true, walletTransactions: true, openedDisputes: true, recommendations: true } },
    },
  });
  if (!user) notFound();

  const jobs = user.clientProfile?.jobs ?? [];
  const applications = user.freelancerProfile?.applications ?? [];
  const roleSubtitle = user.role === "CLIENT" ? user.clientProfile?.companyName : user.role === "FREELANCER" ? user.freelancerProfile?.title : "Platform administrator";
  const stats = [
    { label: "Jobs posted", value: jobs.length },
    { label: "Applications", value: applications.length },
    { label: "Wallet transactions", value: user._count.walletTransactions },
    { label: "Messages", value: user._count.sentMessages + user._count.receivedMessages },
    { label: "Disputes opened", value: user._count.openedDisputes },
    { label: "AI recommendations", value: user._count.recommendations },
  ];

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-neutral-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin/users" className="text-sm font-semibold text-red-600 hover:underline">← All users</Link>
        <header className="mt-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-xl font-bold text-white">{user.name.trim().charAt(0).toUpperCase()}</div>
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-red-500">User account details</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{user.name}</h1><p className="mt-1 text-sm text-neutral-500">{user.email}</p><p className="mt-2 text-sm font-medium text-neutral-700">{roleSubtitle || "Profile not completed"}</p></div>
            </div>
            <div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${user.role === "ADMIN" ? "bg-red-100 text-red-700" : user.role === "CLIENT" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>{user.role}</span><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${user.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{user.isVerified ? "Email verified" : "Email not verified"}</span></div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-neutral-50 p-4"><p className="text-xs text-neutral-500">User ID</p><p className="mt-1 break-all font-mono text-xs">{user.id}</p></div>
            <div className="rounded-xl bg-neutral-50 p-4"><p className="text-xs text-neutral-500">Wallet address</p><p className="mt-1 break-all font-mono text-xs">{user.walletAddress || "Not connected"}</p></div>
            <div className="rounded-xl bg-neutral-50 p-4"><p className="text-xs text-neutral-500">Account created</p><p className="mt-1 text-sm font-semibold">{dateLabel(user.createdAt)}</p></div>
            <div className="rounded-xl bg-neutral-50 p-4"><p className="text-xs text-neutral-500">Last profile update</p><p className="mt-1 text-sm font-semibold">{dateLabel(user.updatedAt)}</p></div>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => <article key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"><p className="text-xs text-neutral-500">{stat.label}</p><p className="mt-2 text-2xl font-bold">{stat.value.toLocaleString()}</p></article>)}
        </section>

        {user.clientProfile ? <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Client profile</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Company" value={user.clientProfile.companyName} /><Info label="Country" value={user.clientProfile.country} /><Info label="Profile complete" value={user.clientProfile.isProfileCompleted ? "Yes" : "No"} /><Info label="Total jobs posted (profile)" value={String(user.clientProfile.totalJobsPosted)} /><Info label="Website" value={user.clientProfile.website} /><Info label="Company bio" value={user.clientProfile.companyBio} />
          </div>
        </section> : null}

        {user.freelancerProfile ? <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Freelancer profile</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Full name" value={user.freelancerProfile.fullName} /><Info label="Professional title" value={user.freelancerProfile.title} /><Info label="Country" value={user.freelancerProfile.country} /><Info label="Location" value={user.freelancerProfile.location} /><Info label="Experience level" value={user.freelancerProfile.experienceLevel} /><Info label="Years of experience" value={String(user.freelancerProfile.yearsOfExperience)} /><Info label="Hourly rate" value={money(user.freelancerProfile.hourlyRate)} /><Info label="Wallet balance" value={money(user.freelancerProfile.walletBalance)} /><Info label="Average rating" value={user.freelancerProfile.averageRating.toFixed(2)} /><Info label="Completed projects (profile)" value={String(user.freelancerProfile.totalProjects)} /><Info label="Available for work" value={user.freelancerProfile.isAvailable ? "Yes" : "No"} /><Info label="Profile complete" value={user.freelancerProfile.isProfileCompleted ? "Yes" : "No"} /><Info label="GitHub" value={user.freelancerProfile.github} /><Info label="LinkedIn" value={user.freelancerProfile.linkedin} /><Info label="Portfolio URL" value={user.freelancerProfile.portfolio} />
          </div><div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Skills</p><div className="mt-2 flex flex-wrap gap-2">{user.freelancerProfile.skills.length ? user.freelancerProfile.skills.map((item) => <span key={item.skillId} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{item.skill.name}</span>) : <span className="text-sm text-neutral-500">No skills added</span>}</div></div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2"><div><h3 className="font-semibold">Experience history</h3>{user.freelancerProfile.experiences.length ? user.freelancerProfile.experiences.map((exp) => <div key={exp.id} className="mt-3 rounded-xl bg-neutral-50 p-3"><p className="font-semibold">{exp.role} · {exp.companyName}</p><p className="mt-1 text-xs text-neutral-500">{dateLabel(exp.startDate)} – {dateLabel(exp.endDate)}</p><p className="mt-2 whitespace-pre-wrap text-sm text-neutral-600">{exp.description}</p></div>) : <p className="mt-2 text-sm text-neutral-500">No experience added.</p>}</div><div><h3 className="font-semibold">Portfolio</h3>{user.freelancerProfile.portfolios.length ? user.freelancerProfile.portfolios.map((item) => <div key={item.id} className="mt-3 rounded-xl bg-neutral-50 p-3"><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-neutral-600">{item.description}</p>{item.projectUrl || item.liveUrl || item.githubUrl ? <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-red-600">{item.projectUrl ? <a href={item.projectUrl} target="_blank" rel="noreferrer">Project ↗</a> : null}{item.liveUrl ? <a href={item.liveUrl} target="_blank" rel="noreferrer">Live ↗</a> : null}{item.githubUrl ? <a href={item.githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a> : null}</div> : null}</div>) : <p className="mt-2 text-sm text-neutral-500">No portfolio items added.</p>}</div></div>
        </section> : null}

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <SectionTitle title="Jobs posted" subtitle="Recent jobs created by this client" />
          {jobs.length ? <div className="divide-y divide-neutral-100">{jobs.map((job) => <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-semibold">{job.title}</p><p className="mt-1 text-xs text-neutral-500">Created {dateLabel(job.createdAt)} · {job._count.applications} applications · {job.milestones.length} milestones</p></div><div className="text-right"><p className="font-semibold">{money(job.budget)}</p><p className="mt-1 text-xs text-neutral-500">{job.status}</p></div></div>)}</div> : <Empty text="This account has not posted any jobs." />}
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <SectionTitle title="Applications" subtitle="Freelancer applications and their current statuses" />
          {applications.length ? <div className="divide-y divide-neutral-100">{applications.map((application) => <div key={application.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-semibold">{application.job.title}</p><p className="mt-1 text-xs text-neutral-500">Applied {dateLabel(application.createdAt)} · Proposed {money(application.proposedBudget)}</p><p className="mt-1 line-clamp-2 max-w-3xl text-sm text-neutral-600">{application.coverLetter}</p></div><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold">{application.status} · {application.job.status}</span></div>)}</div> : <Empty text="No applications found for this account." />}
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <SectionTitle title="Wallet transactions" subtitle="Transaction hashes, amount, network and recorded wallet details" />
          {user.walletTransactions.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-neutral-50 text-xs text-neutral-500"><tr><th className="px-5 py-3">Type</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Network</th><th className="px-5 py-3">Wallet</th><th className="px-5 py-3">Transaction hash</th><th className="px-5 py-3">Date</th></tr></thead><tbody className="divide-y divide-neutral-100">{user.walletTransactions.map((tx) => <tr key={tx.id}><td className="px-5 py-4 font-semibold">{tx.type}</td><td className="px-5 py-4">{money(tx.amount)}</td><td className="px-5 py-4">{tx.network}</td><td className="px-5 py-4 font-mono text-xs">{tx.walletAddress}</td><td className="max-w-48 break-all px-5 py-4 font-mono text-xs">{tx.txHash}</td><td className="whitespace-nowrap px-5 py-4">{dateLabel(tx.createdAt)}</td></tr>)}</tbody></table></div> : <Empty text="No wallet transactions recorded." />}
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <SectionTitle title="Disputes opened" subtitle="Disputes reported by this account" />
          {user.openedDisputes.length ? <div className="divide-y divide-neutral-100">{user.openedDisputes.map((dispute) => <div key={dispute.id} className="p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-semibold">{dispute.milestone.job.title} · {dispute.milestone.title}</p><span className="text-xs font-bold">{dispute.status}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-neutral-600">{dispute.reason}</p>{dispute.adminNotes ? <p className="mt-2 text-sm text-neutral-500">Admin notes: {dispute.adminNotes}</p> : null}<p className="mt-2 text-xs text-neutral-500">Opened {dateLabel(dispute.createdAt)} · Resolved {dateLabel(dispute.resolvedAt)}</p></div>)}</div> : <Empty text="No disputes opened by this account." />}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm"><SectionTitle title="Recent messages sent" subtitle={`Total sent: ${user._count.sentMessages}`} />{user.sentMessages.length ? <div className="divide-y divide-neutral-100">{user.sentMessages.map((message) => <div key={message.id} className="p-4"><p className="font-semibold">To {message.receiver.name} · {message.job.title}</p><p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600">{message.content}</p><p className="mt-2 text-xs text-neutral-500">{dateLabel(message.createdAt)} · {message.isRead ? "Read" : "Unread"}</p></div>)}</div> : <Empty text="No messages sent." />}</div>
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm"><SectionTitle title="Recent messages received" subtitle={`Total received: ${user._count.receivedMessages}`} />{user.receivedMessages.length ? <div className="divide-y divide-neutral-100">{user.receivedMessages.map((message) => <div key={message.id} className="p-4"><p className="font-semibold">From {message.sender.name} · {message.job.title}</p><p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600">{message.content}</p><p className="mt-2 text-xs text-neutral-500">{dateLabel(message.createdAt)} · {message.isRead ? "Read" : "Unread"}</p></div>)}</div> : <Empty text="No messages received." />}</div>
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <SectionTitle title="Notifications" subtitle={`Total notifications: ${user._count.notifications}`} />
          {user.notifications.length ? <div className="divide-y divide-neutral-100">{user.notifications.map((notification) => <div key={notification.id} className="flex flex-wrap justify-between gap-3 p-4"><div><p className="font-semibold">{notification.title}</p><p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600">{notification.message}</p><p className="mt-2 text-xs text-neutral-500">{notification.type} · {dateLabel(notification.createdAt)}</p></div><span className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${notification.isRead ? "bg-neutral-100 text-neutral-600" : "bg-red-100 text-red-700"}`}>{notification.isRead ? "Read" : "Unread"}</span></div>)}</div> : <Empty text="No notifications recorded." />}
        </section>
        <p className="mt-5 text-xs text-neutral-500">Admin-only inspection page. Passwords and other authentication secrets are intentionally excluded.</p>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return <div className="min-w-0 rounded-xl bg-neutral-50 p-3"><p className="text-xs text-neutral-500">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value || "Not provided"}</p></div>;
}
function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="border-b border-neutral-100 p-5"><h2 className="font-bold">{title}</h2><p className="mt-1 text-xs text-neutral-500">{subtitle}</p></div>;
}
function Empty({ text }: { text: string }) {
  return <p className="p-5 text-sm text-neutral-500">{text}</p>;
}
