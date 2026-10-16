"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSkills } from "@/hooks/useSkills";
import SkillSelector from "@/components/profile/SkillSelector";

type Profile = {
  fullName: string | null;
  title: string;
  bio: string;
  country: string | null;
  location: string | null;
  github: string | null;
  linkedin: string | null;
  portfolio: string | null;
  hourlyRate: number;
  yearsOfExperience: number;
  skills: { skillId: string; skill: { id: string; name: string } }[];
};

type FormState = {
  fullName: string;
  title: string;
  bio: string;
  country: string;
  location: string;
  github: string;
  linkedin: string;
  portfolio: string;
  hourlyRate: string;
  yearsOfExperience: string;
};

const emptyForm: FormState = {
  fullName: "",
  title: "",
  bio: "",
  country: "",
  location: "",
  github: "",
  linkedin: "",
  portfolio: "",
  hourlyRate: "10",
  yearsOfExperience: "0",
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: skills = [], isLoading: skillsLoading } = useSkills();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState("");

  const profileQuery = useQuery({
    queryKey: ["freelancer-profile"],
    queryFn: async () => {
      const { data } = await axios.get("/api/freelancer/profile");
      return data as Profile;
    },
  });

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    setForm({
      fullName: profile.fullName ?? "",
      title: profile.title ?? "",
      bio: profile.bio ?? "",
      country: profile.country ?? "",
      location: profile.location ?? "",
      github: profile.github ?? "",
      linkedin: profile.linkedin ?? "",
      portfolio: profile.portfolio ?? "",
      hourlyRate: String(profile.hourlyRate ?? 10),
      yearsOfExperience: String(profile.yearsOfExperience ?? 0),
    });
    setSelectedSkills(profile.skills.map(item => item.skillId));
  }, [profileQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        hourlyRate: Number(form.hourlyRate),
        yearsOfExperience: Number(form.yearsOfExperience),
        skillIds: selectedSkills,
      };
      const { data } = await axios.put("/api/freelancer/profile", payload);
      return data;
    },
    onSuccess: async () => {
      setMessage("Profile and skills saved successfully.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["freelancer-profile"] }),
        queryClient.invalidateQueries({ queryKey: ["experience"] }),
      ]);
    },
    onError: (error: unknown) => {
      setMessage(axios.isAxiosError(error) ? error.response?.data?.message || "Could not save profile." : "Could not save profile.");
    },
  });

  const setField = (field: keyof FormState, value: string) =>
    setForm(current => ({ ...current, [field]: value }));

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-neutral-900 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">Freelancer account</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Profile & Skills</h1>
            <p className="mt-2 text-sm text-neutral-500">Manage the profile fields stored in your freelancer record, then save all changes.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/freelancer/experience" className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold">Work experience</Link>
            <Link href="/freelancer/dashboard" className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold">← Dashboard</Link>
          </div>
        </div>

        {profileQuery.isLoading ? <div className="rounded-2xl border bg-white p-6 text-sm text-neutral-500">Loading your profile…</div> : profileQuery.isError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Could not load your saved profile. Please sign in again and retry.</div> : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-bold">Professional details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">Full name</label><input id="fullName" value={form.fullName} onChange={e=>setField("fullName",e.target.value)} maxLength={150} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 focus:border-red-400 focus:outline-none"/></div>
                <div><label htmlFor="title" className="mb-1.5 block text-sm font-medium">Professional title</label><input id="title" value={form.title} onChange={e=>setField("title",e.target.value)} required maxLength={150} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 focus:border-red-400 focus:outline-none"/></div>
                <div><label htmlFor="country" className="mb-1.5 block text-sm font-medium">Country</label><input id="country" value={form.country} onChange={e=>setField("country",e.target.value)} maxLength={100} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 focus:border-red-400 focus:outline-none"/></div>
                <div><label htmlFor="location" className="mb-1.5 block text-sm font-medium">City / location</label><input id="location" value={form.location} onChange={e=>setField("location",e.target.value)} maxLength={150} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 focus:border-red-400 focus:outline-none"/></div>
                <div><label htmlFor="hourlyRate" className="mb-1.5 block text-sm font-medium">Hourly rate</label><input id="hourlyRate" type="number" min="0" step="any" value={form.hourlyRate} onChange={e=>setField("hourlyRate",e.target.value)} required className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 focus:border-red-400 focus:outline-none"/></div>
                <div><label htmlFor="yearsOfExperience" className="mb-1.5 block text-sm font-medium">Years of experience</label><input id="yearsOfExperience" type="number" min="0" max="80" step="1" value={form.yearsOfExperience} onChange={e=>setField("yearsOfExperience",e.target.value)} required className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 focus:border-red-400 focus:outline-none"/></div>
                <div><label htmlFor="github" className="mb-1.5 block text-sm font-medium">GitHub URL</label><input id="github" type="url" value={form.github} onChange={e=>setField("github",e.target.value)} placeholder="https://github.com/username" className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 focus:border-red-400 focus:outline-none"/></div>
                <div><label htmlFor="linkedin" className="mb-1.5 block text-sm font-medium">LinkedIn URL</label><input id="linkedin" type="url" value={form.linkedin} onChange={e=>setField("linkedin",e.target.value)} placeholder="https://linkedin.com/in/username" className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 focus:border-red-400 focus:outline-none"/></div>
                <div className="sm:col-span-2"><label htmlFor="portfolio" className="mb-1.5 block text-sm font-medium">Portfolio URL</label><input id="portfolio" type="url" value={form.portfolio} onChange={e=>setField("portfolio",e.target.value)} placeholder="https://your-portfolio.example" className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 focus:border-red-400 focus:outline-none"/></div>
                <div className="sm:col-span-2"><label htmlFor="bio" className="mb-1.5 block text-sm font-medium">Professional bio</label><textarea id="bio" rows={5} value={form.bio} onChange={e=>setField("bio",e.target.value)} required maxLength={5000} className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 focus:border-red-400 focus:outline-none"/></div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Skills</h2><span className="text-xs text-neutral-500">{selectedSkills.length} selected</span></div>
              <p className="mt-1 text-sm text-neutral-500">Select all skills that describe the work you can deliver.</p>
              {skillsLoading ? <p className="mt-4 text-sm text-neutral-500">Loading skills…</p> : <div className="mt-4"><SkillSelector skills={skills} selectedSkills={selectedSkills} setSelectedSkills={setSelectedSkills}/></div>}
              {!skillsLoading && skills.length === 0 && <p className="mt-3 text-sm text-neutral-500">No skills exist yet. Ask an administrator to add the available skills.</p>}
            </section>

            {message && <p role="status" className="rounded-xl border border-neutral-200 bg-white p-3 text-sm">{message}</p>}
            <button onClick={()=>{setMessage("");saveMutation.mutate();}} disabled={saveMutation.isPending || profileQuery.isLoading} className="rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">{saveMutation.isPending ? "Saving…" : "Save profile & skills"}</button>
          </div>
        )}
      </div>
    </main>
  );
}
