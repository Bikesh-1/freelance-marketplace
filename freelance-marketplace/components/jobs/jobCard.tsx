import Link from "next/link";

interface JobSkillItem {
  id: string;
  skill: {
    name: string;
  };
}

interface JobItem {
  id: string;
  title: string;
  jobType: string;
  description: string;
  budget: number;
  createdAt: string | Date;
  client: {
    companyName: string;
  };
  skills?: JobSkillItem[];
}

interface Props {
  job: JobItem;
}

export default function JobCard({ job }: Props) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block"
    >
      <article className="group rounded-[18px] border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md sm:p-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div className="min-w-0 flex-1">

            <h2 className="truncate text-lg font-bold tracking-tight text-neutral-950 transition-colors group-hover:text-red-500 sm:text-xl">
              {job.title}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">

              <span className="font-medium text-neutral-700">
                {job.client.companyName}
              </span>

              <span className="text-neutral-300">
                •
              </span>

              <span>
                Posted{" "}
                {new Date(job.createdAt).toLocaleDateString()}
              </span>

            </div>

          </div>

          {/* Job Type */}

          <span className="w-fit shrink-0 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-red-500">
            {job.jobType === "FIXED"
              ? "Fixed Price"
              : job.jobType === "HOURLY"
                ? "Hourly"
                : job.jobType}
          </span>

        </div>

        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <p className="mt-4 line-clamp-3 max-w-4xl text-sm leading-6 text-neutral-500">
          {job.description}
        </p>

        {/* =====================================================
            SKILLS
        ===================================================== */}

        {job.skills && job.skills.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">

            {job.skills.slice(0, 6).map((item: JobSkillItem) => (
              <span
                key={item.id}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[11px] font-medium text-neutral-600 transition group-hover:border-neutral-200"
              >
                {item.skill.name}
              </span>
            ))}

            {job.skills.length > 6 && (
              <span className="rounded-lg bg-neutral-100 px-2.5 py-1.5 text-[11px] font-medium text-neutral-400">
                +{job.skills.length - 6} more
              </span>
            )}

          </div>
        )}

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="mt-6 flex flex-col gap-4 border-t border-neutral-100 pt-5 sm:flex-row sm:items-end sm:justify-between">

          {/* Budget */}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Budget
            </p>

            <p className="mt-1 text-lg font-bold tracking-tight text-neutral-950">
              ${job.budget}
            </p>
          </div>

          {/* CTA */}

          <div className="flex items-center justify-between gap-4 sm:justify-end">

            <span className="text-xs text-neutral-400 sm:hidden">
              View project
            </span>

            <span className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition group-hover:bg-red-500">
              View Details

              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </span>

          </div>

        </div>

      </article>
    </Link>
  );
}