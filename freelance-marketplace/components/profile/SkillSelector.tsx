"use client"

interface Props {
  skills: any[]
  selectedSkills: string[]
  setSelectedSkills: React.Dispatch<
    React.SetStateAction<string[]>
  >
}

export default function SkillSelector({
  skills,
  selectedSkills,
  setSelectedSkills,
}: Props) {
  const toggleSkill = (id: string) => {
    if (selectedSkills.includes(id)) {
      setSelectedSkills(
        selectedSkills.filter((skill) => skill !== id)
      )
    } else {
      setSelectedSkills([
        ...selectedSkills,
        id,
      ])
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {skills?.map((skill) => (
        <button
          key={skill.id}
          type="button"
          onClick={() => toggleSkill(skill.id)}
          className={`px-4 py-2 rounded-lg border transition ${
            selectedSkills.includes(skill.id)
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-slate-900 text-slate-200 border-slate-700"
          }`}
        >
          {skill.name}
        </button>
      ))}
    </div>
  )
}