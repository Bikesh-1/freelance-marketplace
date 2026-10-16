"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type Experience = {
  id: string;
  companyName: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string | null;
};

type ExperienceForm = {
  companyName: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string;
};

const emptyForm: ExperienceForm = {
  companyName: "",
  role: "",
  description: "",
  startDate: "",
  endDate: "",
};

export default function ExperiencePage() {
  const client = useQueryClient();
  const [form, setForm] = useState<ExperienceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const experiencesQuery = useQuery({
    queryKey: ["experience"],
    queryFn: async () => {
      const { data } = await axios.get("/api/freelancer/experience");
      return (data.experiences ?? []) as Experience[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { data } = await axios.put("/api/freelancer/experience", { ...form, id: editingId });
        return data.experience as Experience;
      }
      const { data } = await axios.post("/api/freelancer/experience", form);
      return data.experience as Experience;
    },
    onSuccess: async () => {
      setForm(emptyForm);
      setEditingId(null);
      setNotice("Experience saved.");
      await client.invalidateQueries({ queryKey: ["experience"] });
    },
    onError: (error: unknown) => {
      setNotice(axios.isAxiosError(error) ? error.response?.data?.message || "Could not save experience." : "Could not save experience.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => axios.delete("/api/freelancer/experience", { params: { id } }),
    onSuccess: async () => {
      setNotice("Experience deleted.");
      await client.invalidateQueries({ queryKey: ["experience"] });
      if (editingId) {
        setEditingId(null);
        setForm(emptyForm);
      }
    },
    onError: (error: unknown) => setNotice(axios.isAxiosError(error) ? error.response?.data?.message || "Could not delete experience." : "Could not delete experience."),
  });

  function startEdit(item: Experience) {
    setEditingId(item.id);
    setForm({
      companyName: item.companyName,
      role: item.role,
      description: item.description,
      startDate: item.startDate.slice(0, 10),
      endDate: item.endDate ? item.endDate.slice(0, 10) : "",
    });
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      setNotice("End date must be on or after the start date.");
      return;
    }
    saveMutation.mutate();
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-neutral-900 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">Freelancer profile</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Work Experience</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">Add and maintain your professional work history so clients can understand your background.</p>
          </div>
          <Link href="/freelancer/dashboard" className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold hover:border-red-300">← Dashboard</Link>
        </div>

        <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold">{editingId ? "Edit experience" : "Add experience"}</h2>
          <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="companyName" className="mb-1.5 block text-sm font-medium">Company</label>
              <input id="companyName" value={form.companyName} onChange={e => setForm({...form, companyName:e.target.value})} required maxLength={150} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 outline-none focus:border-red-400" />
            </div>
            <div>
              <label htmlFor="role" className="mb-1.5 block text-sm font-medium">Role / Job title</label>
              <input id="role" value={form.role} onChange={e => setForm({...form, role:e.target.value})} required maxLength={150} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 outline-none focus:border-red-400" />
            </div>
            <div>
              <label htmlFor="startDate" className="mb-1.5 block text-sm font-medium">Start date</label>
              <input id="startDate" type="date" value={form.startDate} onChange={e => setForm({...form, startDate:e.target.value})} required className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 outline-none focus:border-red-400" />
            </div>
            <div>
              <label htmlFor="endDate" className="mb-1.5 block text-sm font-medium">End date <span className="font-normal text-neutral-400">(optional for current role)</span></label>
              <input id="endDate" type="date" min={form.startDate || undefined} value={form.endDate} onChange={e => setForm({...form, endDate:e.target.value})} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 outline-none focus:border-red-400" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium">Description</label>
              <textarea id="description" rows={4} value={form.description} onChange={e => setForm({...form, description:e.target.value})} required maxLength={5000} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 outline-none focus:border-red-400" />
            </div>
            {notice && <p role="status" className="sm:col-span-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm">{notice}</p>}
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button type="submit" disabled={saveMutation.isPending} className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saveMutation.isPending ? "Saving..." : editingId ? "Update experience" : "Save experience"}</button>
              {editingId && <button type="button" onClick={() => {setEditingId(null);setForm(emptyForm);setNotice("");}} className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold">Cancel edit</button>}
            </div>
          </form>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Your work history</h2><span className="text-sm text-neutral-500">{experiencesQuery.data?.length ?? 0} entries</span></div>
          {experiencesQuery.isLoading ? <p className="rounded-xl border bg-white p-6 text-sm text-neutral-500">Loading experience…</p> : experiencesQuery.isError ? <p className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Could not load experience. Check your sign-in and try again.</p> : !experiencesQuery.data?.length ? <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center"><p className="font-semibold">No experience added yet</p><p className="mt-1 text-sm text-neutral-500">Use the form above to add your first entry.</p></div> : experiencesQuery.data.map(item => <article key={item.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0">
                <h3 className="text-lg font-bold">{item.role}</h3>
                <p className="mt-1 font-medium text-neutral-600">{item.companyName}</p>
                <p className="mt-1 text-xs text-neutral-500">{new Date(item.startDate).toLocaleDateString(undefined,{month:"short",year:"numeric"})} – {item.endDate ? new Date(item.endDate).toLocaleDateString(undefined,{month:"short",year:"numeric"}) : "Present"}</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-neutral-600">{item.description}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => startEdit(item)} className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold hover:border-red-300">Edit</button>
                <button onClick={() => {if (window.confirm("Delete this experience entry?")) deleteMutation.mutate(item.id);}} disabled={deleteMutation.isPending} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Delete</button>
              </div>
            </div>
          </article>)}
        </section>
      </div>
    </main>
  );
}
