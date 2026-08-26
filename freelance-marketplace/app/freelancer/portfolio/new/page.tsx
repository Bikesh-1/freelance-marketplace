"use client";

import { useState } from "react";
import ImageUploader from "@/components/upload/ImageUploader";

export default function NewPortfolioPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const submitHandler = async () => {
    if (!title.trim()) {
      alert("Please enter a project title.");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a project description.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/freelancer/portfolio", {
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
      });

      if (!response.ok) {
        throw new Error("Failed to create portfolio project");
      }

      window.location.href = "/freelancer/portfolio";
    } catch (error) {
      console.error(error);
      alert("Failed to save portfolio project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-neutral-900 sm:px-6 lg:py-12">

      <div className="mx-auto max-w-3xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mb-8">

          <div className="mb-3 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-red-500" />

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Freelancer Portfolio
            </span>

          </div>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Add Portfolio Project
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
            Showcase your work and help clients understand what you
            can build.
          </p>

        </section>

        {/* =====================================================
            FORM
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">

          {/* Card Header */}

          <div className="border-b border-neutral-100 px-5 py-5 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-500">
                01
              </div>

              <div>

                <h2 className="text-sm font-semibold text-neutral-950">
                  Project Information
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  Add the important details about your project.
                </p>

              </div>

            </div>

          </div>

          <div className="space-y-6 p-5 sm:p-6">

            {/* =================================================
                TITLE
            ================================================= */}

            <div>

              <label
                htmlFor="title"
                className="mb-2 block text-xs font-semibold text-neutral-800"
              >
                Project Title
              </label>

              <input
                id="title"
                type="text"
                placeholder="e.g. Freelance Marketplace Platform"
                value={title}
                disabled={loading}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="description"
                  className="text-xs font-semibold text-neutral-800"
                >
                  Project Description
                </label>

                <span className="text-[10px] text-neutral-400">
                  {description.length} characters
                </span>

              </div>

              <textarea
                id="description"
                rows={7}
                placeholder="Describe what you built, the problem it solves, your role, and the technologies you used..."
                value={description}
                disabled={loading}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-[10px] leading-4 text-neutral-400">
                A clear description helps clients understand your
                contribution and experience.
              </p>

            </div>

            {/* =================================================
                LINKS
            ================================================= */}

            <div>

              <div className="mb-4">

                <h3 className="text-sm font-semibold text-neutral-950">
                  Project Links
                </h3>

                <p className="mt-1 text-xs text-neutral-500">
                  Add links where clients can explore your project.
                </p>

              </div>

              <div className="space-y-4">

                {/* GitHub */}

                <div>

                  <label
                    htmlFor="githubUrl"
                    className="mb-2 block text-xs font-semibold text-neutral-800"
                  >
                    GitHub URL
                  </label>

                  <input
                    id="githubUrl"
                    type="url"
                    placeholder="https://github.com/username/project"
                    value={githubUrl}
                    disabled={loading}
                    onChange={(e) =>
                      setGithubUrl(e.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

                {/* Live URL */}

                <div>

                  <label
                    htmlFor="liveUrl"
                    className="mb-2 block text-xs font-semibold text-neutral-800"
                  >
                    Live Project URL
                  </label>

                  <input
                    id="liveUrl"
                    type="url"
                    placeholder="https://yourproject.com"
                    value={liveUrl}
                    disabled={loading}
                    onChange={(e) =>
                      setLiveUrl(e.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

              </div>

            </div>

            {/* =================================================
                IMAGE
            ================================================= */}

            <div>

              <div className="mb-4">

                <h3 className="text-sm font-semibold text-neutral-950">
                  Project Preview
                </h3>

                <p className="mt-1 text-xs text-neutral-500">
                  Upload an image that represents your project.
                </p>

              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">

                <ImageUploader
                  value={imageUrl}
                  onChange={setImageUrl}
                />

              </div>

            </div>

            {/* =================================================
                PREVIEW SUMMARY
            ================================================= */}

            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold text-white">
                  {title
                    ? title.charAt(0).toUpperCase()
                    : "P"}
                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {title || "Your Project Title"}
                  </p>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">
                    {description ||
                      "Your project description will appear here."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {githubUrl && (
                      <span className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-medium text-neutral-500">
                        GitHub
                      </span>
                    )}

                    {liveUrl && (
                      <span className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-medium text-neutral-500">
                        Live Project
                      </span>
                    )}

                    {imageUrl && (
                      <span className="rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-medium text-red-500">
                        Preview Added
                      </span>
                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="button"
              onClick={submitHandler}
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Saving Project...
                </>
              ) : (
                <>
                  Save Portfolio Project
                  <span>→</span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] leading-4 text-neutral-400">
              You can update your portfolio project later.
            </p>

          </div>

        </section>

      </div>
    </main>
  );
}