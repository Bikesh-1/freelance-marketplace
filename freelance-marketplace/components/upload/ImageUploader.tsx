"use client"

import { useState } from "react"

interface Props {
  value?: string
  onChange: (url: string) => void
}

export default function ImageUploader({
  value,
  onChange,
}: Props) {
  const [uploading, setUploading] = useState(false)

  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    const formData = new FormData()

    formData.append("file", file)

    setUploading(true)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    setUploading(false)

    if (data.url) {
      onChange(data.url)
    }
  }

  return (
    <div className="space-y-4">
      {value && (
        <img
          src={value}
          alt="Uploaded"
          className="w-48 h-48 object-cover rounded-xl border border-slate-700"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={uploadImage}
        className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-500"
      />

      {uploading && (
        <p className="text-sm text-slate-400">
          Uploading...
        </p>
      )}
    </div>
  )
}