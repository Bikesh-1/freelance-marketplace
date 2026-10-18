"use client";

import { useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  skills: any[];
  selectedSkills: string[];
  setSelectedSkills: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function SkillSelector({
  skills,
  selectedSkills,
  setSelectedSkills,
}: Props) {
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const toggleSkill = (id: string) => {
    setSelectedSkills((current) =>
      current.includes(id) ? current.filter((skill) => skill !== id) : [...current, id]
    );
  };

  const addSkill = async () => {
    const name = newSkill.trim().replace(/\s+/g, " ");
    if (!name) {
      setError("Enter a skill name first.");
      return;
    }
    if (name.length > 80) {
      setError("Skill names must be 80 characters or fewer.");
      return;
    }

    const existing = skills.find((skill) => skill.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setSelectedSkills((current) => current.includes(existing.id) ? current : [...current, existing.id]);
      setNewSkill("");
      setError("");
      return;
    }

    try {
      setAdding(true);
      setError("");
      const { data } = await axios.post("/api/skills", { name });
      const created = data.skill;
      await queryClient.invalidateQueries({ queryKey: ["skills"] });
      setSelectedSkills((current) => current.includes(created.id) ? current : [...current, created.id]);
      setNewSkill("");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        await queryClient.invalidateQueries({ queryKey: ["skills"] });
        setError("That skill already exists. Select it from the list.");
      } else {
        setError(axios.isAxiosError(err) ? err.response?.data?.message || "Could not add this skill." : "Could not add this skill.");
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {skills?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => {
            const selected = selectedSkills.includes(skill.id);
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.id)}
                aria-pressed={selected}
                className={`rounded-lg border px-3.5 py-2 text-sm transition ${selected
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-indigo-300 hover:bg-indigo-50"}`}
              >
                {selected ? "✓ " : "+ "}{skill.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-3">
        <label htmlFor="add-custom-skill" className="mb-2 block text-sm font-medium text-neutral-800">
          Don’t see your skill? Add it yourself
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="add-custom-skill"
            value={newSkill}
            onChange={(event) => { setNewSkill(event.target.value); setError(""); }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void addSkill();
              }
            }}
            maxLength={80}
            placeholder="e.g. Next.js, UI/UX Design, Solidity"
            disabled={adding}
            className="h-10 min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void addSkill()}
            disabled={adding || !newSkill.trim()}
            className="h-10 rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add skill"}
          </button>
        </div>
        {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
        <p className="mt-2 text-xs text-neutral-500">Your new skill will be added to the shared list and selected automatically.</p>
      </div>
    </div>
  );
}
