import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect(session.user.role === "CLIENT" ? "/client/dashboard" : "/freelancer/dashboard");

  const [users, total, admins, clients, freelancers, verified] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        clientProfile: { select: { companyName: true, country: true, isProfileCompleted: true } },
        freelancerProfile: { select: { title: true, country: true, hourlyRate: true, averageRating: true, isProfileCompleted: true } },
        _count: { select: { notifications: true, sentMessages: true, receivedMessages: true, walletTransactions: true, openedDisputes: true } },
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "FREELANCER" } }),
    prisma.user.count({ where: { isVerified: true } }),
  ]);

  const stats = [{ label: "All accounts", value: total }, { label: "Admins", value: admins }, { label: "Clients", value: clients }, { label: "Freelancers", value: freelancers }, { label: "Verified email", value: verified }];

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-neutral-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-red-600 hover:underline">← Admin dashboard</Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-red-500">Administration / Users</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">User management</h1>
            <p className="mt-2 text-sm text-neutral-500">Browse every account and open a profile for its complete marketplace activity.</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"><span className="text-neutral-500">Total accounts</span><strong className="ml-3 text-lg">{total.toLocaleString()}</strong></div>
        </div>
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => <article key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"><p className="text-xs text-neutral-500">{stat.label}</p><p className="mt-2 text-2xl font-bold">{stat.value.toLocaleString()}</p></article>)}
        </section>
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 p-5"><div><h2 className="font-bold">All registered users</h2><p className="mt-1 text-xs text-neutral-500">Select any user to inspect profile, jobs, applications, wallet activity and account history.</p></div><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold">{users.length} accounts</span></div>
          {users.length ? <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500"><tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Profile</th><th className="px-5 py-4">Email status</th><th className="px-5 py-4">Activity</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4">Details</th></tr></thead>
            <tbody className="divide-y divide-neutral-100">{users.map((user) => {
              const profileName = user.clientProfile?.companyName || user.freelancerProfile?.title || "Profile not completed";
              const activity = user._count.sentMessages + user._count.receivedMessages + user._count.walletTransactions + user._count.openedDisputes;
              return <tr key={user.id} className="transition hover:bg-red-50/40">
                <td className="px-5 py-4"><Link href={`/admin/users/${user.id}`} className="group block"><span className="font-semibold group-hover:text-red-600">{user.name}</span><span className="mt-1 block text-xs text-neutral-500">{user.email}</span></Link></td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.role === "ADMIN" ? "bg-red-100 text-red-700" : user.role === "CLIENT" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>{user.role}</span></td>
                <td className="px-5 py-4"><span className="font-medium">{profileName}</span><span className="mt-1 block text-xs text-neutral-500">{user.clientProfile?.country || user.freelancerProfile?.country || "Country not set"}</span></td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{user.isVerified ? "Verified" : "Unverified"}</span></td>
                <td className="px-5 py-4"><span className="font-semibold">{activity}</span><span className="mt-1 block text-xs text-neutral-500">{user._count.notifications} notifications</span></td>
                <td className="whitespace-nowrap px-5 py-4 text-neutral-600">{user.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td className="px-5 py-4"><Link href={`/admin/users/${user.id}`} className="inline-flex whitespace-nowrap rounded-lg bg-neutral-950 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600">View profile →</Link></td>
              </tr>;
            })}</tbody>
          </table></div> : <div className="p-12 text-center"><h3 className="font-semibold">No users found</h3><p className="mt-2 text-sm text-neutral-500">Registered accounts will appear here.</p></div>}
        </section>
        <p className="mt-4 text-xs text-neutral-500">Sensitive credentials such as passwords are never displayed. This view is restricted to administrators.</p>
      </div>
    </main>
  );
}
