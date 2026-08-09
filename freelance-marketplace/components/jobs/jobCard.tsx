
import Link from "next/link"

interface Props {
  job: any
}

export default function JobCard({
  job,
}: Props) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-indigo-600 transition cursor-pointer">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-white">
            {job.title}
          </h2>

          <span className="rounded-full bg-indigo-600/20 px-3 py-1 text-sm text-indigo-300">
            {job.jobType}
          </span>
        </div>

        <p className="text-slate-400 mt-3 line-clamp-3">
          {job.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.skills?.map((item: any) => (
            <span
              key={item.id}
              className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
            >
              {item.skill.name}
            </span>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center text-sm text-slate-400">
          <div>
            <p className="font-medium text-white">
              {job.client.companyName}
            </p>

            <p>
              Budget: ${job.budget}
            </p>
          </div>

          <div className="text-right">
            <p>
              {new Date(job.createdAt).toLocaleDateString()}
            </p>

            <p className="text-indigo-400">
              View Details →
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}