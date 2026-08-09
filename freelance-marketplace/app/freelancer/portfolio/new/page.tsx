"use client"

import { useState } from "react"
import ImageUploader from "@/components/upload/ImageUploader"

export default function NewPortfolioPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [liveUrl, setLiveUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const submitHandler = async () => {
    await fetch("/api/freelancer/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        githubUrl,
        liveUrl,
        imageUrl,
      }),
    })

    window.location.href = "/freelancer/portfolio"
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 space-y-6">
      <h1 className="text-3xl font-bold">
        Add Portfolio Project
      </h1>

      <input
        placeholder="Project Title"
        className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Project Description"
        rows={5}
        className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        placeholder="GitHub URL"
        className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
        onChange={(e) => setGithubUrl(e.target.value)}
      />

      <input
        placeholder="Live URL"
        className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
        onChange={(e) => setLiveUrl(e.target.value)}
      />

      <ImageUploader
        value={imageUrl}
        onChange={setImageUrl}
      />

      <button
        onClick={submitHandler}
        className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-500"
      >
        Save Portfolio
      </button>
    </div>
  )
}