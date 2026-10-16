"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type Recommendation = {
  id?: string;
  score: number;
  reason: string;
  job: {
    id: string;
    title: string;
    description: string;
    budget: number;
    jobType: string;
    duration: string | null;
    deadline: string;
    client: { companyName: string; country?: string | null };
    skills: { skill: { id: string; name: string } }[];
    requiredSkills: string[];
  };
};

export default function RecommendationsPage() {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["job-recommendations"],
    queryFn: async () => {
      const { data } = await axios.get("/api/recommendations");
      return data.recommendations as Recommendation[];
    },
  });
  const generate = useMutation({
    mutationFn: async () => (await axios.post("/api/recommendations")).data,
    onSuccess: async data => {
      setMessage(`Updated ${data.count} recommendations. ${data.method}`);
      await queryClient.invalidateQueries({ queryKey: ["job-recommendations"] });
    },
    onError: error => {
      setMessage(axios.isAxiosError(error) ? error.response?.data?.message || "Could not generate recommendations." : "Could not generate recommendations.");
    },
  });

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-neutral-900 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">Personalized job discovery</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Recommended Jobs</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">Jobs are ranked by overlap between your saved skills and the job's required skills. Check the details before applying.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/freelancer/dashboard" className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold">← Dashboard</Link>
            <button onClick={() => {setMessage("");generate.mutate();}} disabled={generate.isPending} className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{generate.isPending ? "Matching…" : "Refresh matches"}</button>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          This is explainable skill-match scoring stored in the recommendation model—not an AI/ML prediction. Add skills in Settings for more useful matches.
        </div>
        {message && <p role="status" className="mb-4 rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-700">{message}</p>}
        {query.isLoading ? <div className="rounded-2xl border bg-white p-8 text-neutral-500">Loading recommendations…</div> :
         query.isError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Could not load saved recommendations. Refresh the matches after signing in.</div> :
         !query.data?.length ? <section className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
           <h2 className="text-lg font-semibold">No saved recommendations yet</h2>
           <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-neutral-500">Generate your first set of matches from open jobs. Recommendations update whenever you refresh them.</p>
           <button onClick={() => generate.mutate()} disabled={generate.isPending} className="mt-5 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{generate.isPending ? "Matching…" : "Generate recommendations"}</button>
         </section> :
         <section className="grid gap-4 lg:grid-cols-2">
           {query.data.map(item => <article key={item.id ?? item.job.id} className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
             <div className="flex items-start justify-between gap-3">
               <div className="min-w-0"><h2 className="text-lg font-bold">{item.job.title}</h2><p className="mt-1 text-sm text-neutral-500">{item.job.client.companyName}{item.job.client.country ? ` · ${item.job.client.country}` : ""}</p></div>
               <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${item.score >= 60 ? "bg-green-50 text-green-700" : item.score > 0 ? "bg-amber-50 text-amber-800" : "bg-neutral-100 text-neutral-600"}`}>{item.score}% match</span>
             </div>
             <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm leading-6 text-neutral-600">{item.job.description}</p>
             <p className="mt-3 text-sm font-semibold">{item.job.jobType === "FIXED" ? "Fixed price" : item.job.jobType} · Budget {item.job.budget}</p>
             <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">{item.reason}</p>
             <div className="mt-3 flex flex-wrap gap-2">{[...new Set([...item.job.requiredSkills, ...item.job.skills.map(skill => skill.skill.name)])].map(skill => <span key={skill} className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600">{skill}</span>)}</div>
             <div className="mt-auto pt-5"><Link href={`/jobs/${item.job.id}`} className="inline-flex rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500">View job →</Link></div>
           </article>)}
         </section>}
      </div>
    </main>
  );
}
