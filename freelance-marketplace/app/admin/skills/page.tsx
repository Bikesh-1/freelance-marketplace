"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type Skill = { id: string; name: string; createdAt?: string };

export default function AdminSkillsPage() {
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const skillsQuery = useQuery({
    queryKey: ["skills"],
    queryFn: async () => (await axios.get("/api/skills")).data.skills as Skill[],
  });
  const createSkill = useMutation({
    mutationFn: async (skillName: string) => (await axios.post("/api/skills", { name: skillName })).data.skill as Skill,
    onSuccess: async (skill) => {
      setName("");
      setMessage(`Added skill: ${skill.name}`);
      await client.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: (error: unknown) => setMessage(axios.isAxiosError(error) ? error.response?.data?.message || "Could not add skill." : "Could not add skill."),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    createSkill.mutate(name.trim());
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-neutral-900 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">Administration</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Skill Catalogue</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">Manage the skills freelancers can add to their profiles and clients can attach to jobs.</p>
          </div>
          <Link href="/admin" className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold">← Admin dashboard</Link>
        </div>

        <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold">Add a skill</h2>
          <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input value={name} onChange={event => setName(event.target.value)} maxLength={80} required placeholder="e.g. TypeScript" className="min-w-0 flex-1 rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-red-400" />
            <button type="submit" disabled={createSkill.isPending} className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{createSkill.isPending ? "Adding…" : "Add skill"}</button>
          </form>
          {message && <p role="status" className="mt-3 text-sm text-neutral-600">{message}</p>}
          <p className="mt-3 text-xs leading-5 text-neutral-500">Only administrators can create entries. The API validates unique skill names.</p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <h2 className="font-bold">Available skills</h2>
            <span className="text-sm text-neutral-500">{skillsQuery.data?.length ?? 0} total</span>
          </div>
          {skillsQuery.isLoading ? <p className="p-6 text-sm text-neutral-500">Loading skills…</p> :
           skillsQuery.isError ? <p className="p-6 text-sm text-red-600">Could not load skill catalogue.</p> :
           !skillsQuery.data?.length ? <p className="p-6 text-sm text-neutral-500">No skills yet. Add the first skill above.</p> :
           <div className="flex flex-wrap gap-2 p-5">{skillsQuery.data.map(skill => <span key={skill.id} className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm">{skill.name}</span>)}</div>}
        </section>
      </div>
    </main>
  );
}
