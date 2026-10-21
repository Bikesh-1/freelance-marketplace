import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect(session.user.role === "CLIENT" ? "/client/dashboard" : "/freelancer/dashboard");

  const [
    users,
    clients,
    freelancers,
    openJobs,
    pendingApplications,
    openDisputes,
    totalSkills,
    recentJobs,
    recentDisputes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.clientProfile.count(),
    prisma.freelancerProfile.count(),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.skill.count(),
    prisma.job.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { client: { select: { companyName: true } } } }),
    prisma.dispute.findMany({ take: 5, where: { status: { in: ["OPEN", "UNDER_REVIEW"] } }, orderBy: { createdAt: "desc" }, include: { milestone: { include: { job: { select: { id: true, title: true } } } }, openedBy: { select: { name: true, role: true } } } }),
  ]);

  const stats = [
    { label: "Users", value: users },
    { label: "Client profiles", value: clients },
    { label: "Freelancer profiles", value: freelancers },
    { label: "Open jobs", value: openJobs },
    { label: "Pending applications", value: pendingApplications },
    { label: "Active disputes", value: openDisputes },
    { label: "Skills", value: totalSkills },
  ];

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-neutral-900 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">Administration</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Marketplace overview</h1>
            <p className="mt-2 text-sm text-neutral-500">Operational counts from the live database.</p>
          </div>
          <Link href="/" className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold">Visit marketplace</Link>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const card = (
              <>
                <p className="text-xs font-medium text-neutral-500">{item.label}</p>
                <p className="mt-2 text-3xl font-bold">{item.value.toLocaleString()}</p>
                {"href" in item && item.href ? <p className="mt-3 text-xs font-semibold text-red-600">View all users →</p> : null}
              </>
            );
            return "href" in item && item.href ? (
              <Link key={item.label} href={item.href} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500">
                {card}
              </Link>
            ) : (
              <article key={item.label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">{card}</article>
            );
          })}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 p-5"><div><h2 className="font-bold">Recent jobs</h2><p className="mt-1 text-xs text-neutral-500">Most recently created marketplace jobs</p></div><Link href="/jobs" className="text-xs font-semibold text-red-600 hover:underline">View jobs →</Link></div>
            {recentJobs.length ? <div className="divide-y divide-neutral-100">{recentJobs.map(job => <div key={job.id} className="p-4"><p className="font-semibold">{job.title}</p><p className="mt-1 text-xs text-neutral-500">{job.client.companyName} · {job.status} · Budget {job.budget}</p></div>)}</div> : <p className="p-5 text-sm text-neutral-500">No jobs have been created yet.</p>}
          </article>
          <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 p-5"><div><h2 className="font-bold">Active disputes</h2><p className="mt-1 text-xs text-neutral-500">Disputes awaiting review</p></div><Link href="/admin/disputes" className="text-xs font-semibold text-red-600 hover:underline">Manage disputes →</Link></div>
            {recentDisputes.length ? <div className="divide-y divide-neutral-100">{recentDisputes.map(dispute => <div key={dispute.id} className="p-4"><p className="font-semibold">{dispute.milestone.job.title}</p><p className="mt-1 line-clamp-2 text-sm text-neutral-600">{dispute.reason}</p><p className="mt-1 text-xs text-neutral-500">Opened by {dispute.openedBy.name} ({dispute.openedBy.role}) · {dispute.status}</p></div>)}</div> : <p className="p-5 text-sm text-neutral-500">No active disputes.</p>}
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold">Admin tools</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/admin/skills" className="rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500">Manage skill catalogue</Link>
            <Link href="/admin/disputes" className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold">Review disputes</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
