"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import PortfolioCard from "@/components/profile/PortfolioCard";

export default function PortfolioPage() {
  const { data: projects, isLoading } = usePortfolio();

  /* ============================================================
     LOADING
  ============================================================ */

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

          {/* Header Skeleton */}

          <div className="mb-8 animate-pulse">
            <div className="h-3 w-32 rounded bg-neutral-200" />

            <div className="mt-4 h-9 w-64 rounded bg-neutral-200" />

            <div className="mt-3 h-4 w-96 max-w-full rounded bg-neutral-100" />
          </div>

          {/* Cards Skeleton */}

          <div className="grid gap-5 md:grid-cols-2">

            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="h-48 rounded-xl bg-neutral-100" />

                <div className="mt-5 h-5 w-2/3 rounded bg-neutral-200" />

                <div className="mt-3 h-3 w-full rounded bg-neutral-100" />

                <div className="mt-2 h-3 w-4/5 rounded bg-neutral-100" />

              </div>
            ))}

          </div>

        </div>
      </main>
    );
  }

  const portfolioProjects = projects || [];

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mb-8">

          <div className="mb-2 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-red-500" />

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Freelancer Profile
            </span>

          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                My Portfolio
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                Showcase your best work and give clients a clear view
                of your experience.
              </p>

            </div>

            {/* Project Count */}

            <div className="w-fit rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-500 shadow-sm">

              {portfolioProjects.length}{" "}
              {portfolioProjects.length === 1
                ? "Project"
                : "Projects"}

            </div>

          </div>

        </section>

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {portfolioProjects.length === 0 ? (

          <section className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-400">
              +
            </div>

            <h2 className="mt-5 text-lg font-semibold text-neutral-950">
              Your portfolio is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Add your best projects to show clients what you can
              build and what you have worked on.
            </p>

          </section>

        ) : (

          /* =====================================================
             PORTFOLIO GRID
          ===================================================== */

          <section>

            <div className="mb-4 flex items-center justify-between">

              <div>

                <h2 className="text-base font-semibold text-neutral-950">
                  Featured Work
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  Your latest portfolio projects.
                </p>

              </div>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {portfolioProjects.map((project: any) => (

                <div
                  key={project.id}
                  className="group rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
                >

                  <PortfolioCard
                    project={project}
                  />

                </div>

              ))}

            </div>

          </section>

        )}

      </div>

    </main>
  );
}