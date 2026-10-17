import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import Navbar from "@/components/layout/navbar";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ClientFreelancerProfilePage({
  params,
}: {
  params: Promise<{ freelancerId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "CLIENT") redirect("/login");

  const { freelancerId } = await params;
  const freelancer = await prisma.freelancerProfile.findUnique({
    where: { id: freelancerId },
    include: {
      skills: { include: { skill: true } },
      portfolios: { orderBy: { createdAt: "desc" } },
      experiences: { orderBy: { startDate: "desc" } },
      reviews: {
        where: { isVisible: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { client: { select: { companyName: true } } },
      },
    },
  });

  if (!freelancer) notFound();

  const averageRating =
    freelancer.reviews.length > 0
      ? freelancer.reviews.reduce((sum, review) => sum + review.rating, 0) /
        freelancer.reviews.length
      : freelancer.averageRating;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-neutral-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="javascript:history.back()"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-red-500"
          >
            <span aria-hidden="true">←</span> Back
          </Link>

          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-2xl font-bold text-white">
                {(freelancer.fullName || freelancer.title || "F").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {freelancer.fullName || "Freelancer"}
                  </h1>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${freelancer.isAvailable ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-600"}`}>
                    {freelancer.isAvailable ? "Available for work" : "Currently unavailable"}
                  </span>
                </div>
                <p className="mt-2 text-base font-medium text-neutral-600">{freelancer.title}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-500">
                  <span>{freelancer.experienceLevel.toLowerCase()} level</span>
                  <span>{freelancer.yearsOfExperience} years experience</span>
                  <span>{freelancer.location || freelancer.country || "Location not specified"}</span>
                  <span>${freelancer.hourlyRate}/hr</span>
                  <span>★ {averageRating.toFixed(1)} rating</span>
                </div>
              </div>
            </div>
            <div className="mt-7 border-t border-neutral-100 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">About</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-700">
                {freelancer.bio || "This freelancer has not added a bio yet."}
              </p>
            </div>
            {freelancer.skills.length > 0 && (
              <div className="mt-7 border-t border-neutral-100 pt-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {freelancer.skills.map(({ skill }) => (
                    <span key={skill.id} className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-700">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {freelancer.portfolios.length > 0 && (
              <div className="mt-7 border-t border-neutral-100 pt-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Portfolio</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {freelancer.portfolios.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-neutral-200 p-4">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{item.description}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                        {item.projectUrl && <a className="text-red-600 hover:underline" href={item.projectUrl} target="_blank" rel="noreferrer">Project ↗</a>}
                        {item.liveUrl && <a className="text-red-600 hover:underline" href={item.liveUrl} target="_blank" rel="noreferrer">Live demo ↗</a>}
                        {item.githubUrl && <a className="text-red-600 hover:underline" href={item.githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
            {freelancer.experiences.length > 0 && (
              <div className="mt-7 border-t border-neutral-100 pt-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Experience</h2>
                <div className="mt-3 space-y-4">
                  {freelancer.experiences.map((experience) => (
                    <article key={experience.id} className="border-l-2 border-red-400 pl-4">
                      <h3 className="font-semibold">{experience.role}</h3>
                      <p className="mt-1 text-sm text-neutral-500">{experience.companyName}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{experience.description}</p>
                      <p className="mt-2 text-xs text-neutral-400">
                        {experience.startDate.toLocaleDateString("en", { month: "short", year: "numeric" })} – {experience.endDate ? experience.endDate.toLocaleDateString("en", { month: "short", year: "numeric" }) : "Present"}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-7 border-t border-neutral-100 pt-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Recent reviews</h2>
                <span className="text-xs text-neutral-400">{freelancer.reviews.length} shown</span>
              </div>
              {freelancer.reviews.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-500">No visible reviews yet.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {freelancer.reviews.map((review) => (
                    <article key={review.id} className="rounded-2xl bg-neutral-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{review.client.companyName}</p>
                        <p className="text-sm font-semibold text-amber-600">★ {review.rating}/5</p>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{review.comment}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
