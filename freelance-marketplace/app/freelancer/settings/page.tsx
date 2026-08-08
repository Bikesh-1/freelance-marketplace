"use client"

import { useState } from "react"
import { useSkills } from "@/hooks/useSkills"
import SkillSelector from "@/components/profile/SkillSelector"

export default function SettingsPage() {
  const { data: skills } = useSkills()

  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">
        Freelancer Settings
      </h1>

      <div className="space-y-6">
        <div>
          <label className="text-lg font-medium mb-3 block">
            Select Your Skills
          </label>

          <SkillSelector
            skills={skills || []}
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
          />
        </div>
      </div>
    </div>
  )
}