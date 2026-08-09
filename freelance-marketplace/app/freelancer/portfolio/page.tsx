"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import PortfolioCard from "@/components/profile/PortfolioCard";

export default function PortfolioPage() {
  const { data: projects, isLoading } = usePortfolio();

  if (isLoading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">
        My Portfolio
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {projects?.map((project: any) => (
          <PortfolioCard
            key={project.id}
            project={project}
          />
        ))}
      </div>
    </div>
  );
}