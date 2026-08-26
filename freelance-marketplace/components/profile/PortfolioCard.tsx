interface Portfolio {
  id: string;
  title: string;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
}

export default function PortfolioCard({
  project,
}: {
  project: Portfolio;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">

      {/* =====================================================
          PROJECT HEADER
      ===================================================== */}

      <div className="p-5 sm:p-6">

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <div className="mb-3 flex items-center gap-2">

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-500">
                P
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Portfolio Project
              </span>

            </div>

            <h3 className="truncate text-lg font-bold tracking-tight text-neutral-950 transition group-hover:text-red-500 sm:text-xl">
              {project.title}
            </h3>

          </div>

          <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-500">
            Project
          </span>

        </div>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <p className="mt-4 line-clamp-4 text-sm leading-6 text-neutral-500">
          {project.description}
        </p>

        {/* =================================================
            LINKS
        ================================================= */}

        {(project.githubUrl || project.liveUrl) && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-100 pt-5">

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-red-500"
              >
                <span className="text-sm">◉</span>
                GitHub →
                
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-500"
              >
                Live Demo →
                
              </a>
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-5 py-3 sm:px-6">

        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          Featured Work
        </span>

        <span className="text-xs font-semibold text-neutral-400 transition group-hover:text-red-500">
          Explore →
        </span>

      </div>

    </article>
  );
}