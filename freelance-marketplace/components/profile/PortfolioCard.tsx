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
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-xl font-semibold mb-2">
        {project.title}
      </h3>

      <p className="text-slate-400 mb-4">
        {project.description}
      </p>

      <div className="flex gap-4">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            className="text-indigo-400 hover:text-indigo-300"
          >
            GitHub
          </a>
        )}

        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            className="text-green-400 hover:text-green-300"
          >
            Live Demo
          </a>
        )}
      </div>
    </div>
  );
}