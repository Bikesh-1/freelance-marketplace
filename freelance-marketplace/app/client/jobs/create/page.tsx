"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CreateJobPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    jobType: "",
    duration: "",
    deadline: "",
    requiredSkills: [],
  });

  const [loading, setLoading] = useState(false);

  const submitHandler = async () => {
    if (
      !form.title ||
      !form.description ||
      !form.budget ||
      !form.jobType ||
      !form.deadline
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/api/jobs", {
        ...form,
        budget: Number(form.budget),
        skillIds: [],
      });

      router.push("/client/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to create job");
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
              Client Workspace
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Post a New Job
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
            Tell freelancers what you need, define your budget and
            set a deadline for your project.
          </p>

        </section>

        {/* =====================================================
            FORM CARD
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
                  Add the details freelancers need to understand
                  your project.
                </p>

              </div>

            </div>

          </div>

          <div className="space-y-6 p-5 sm:p-6">

            {/* =================================================
                JOB TITLE
            ================================================= */}

            <div>

              <label
                htmlFor="job-title"
                className="mb-2 block text-xs font-semibold text-neutral-800"
              >
                Job Title
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="job-title"
                type="text"
                placeholder="e.g. Build a modern React dashboard"
                value={form.title}
                disabled={loading}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="job-description"
                  className="text-xs font-semibold text-neutral-800"
                >
                  Job Description
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <span className="text-[10px] text-neutral-400">
                  {form.description.length} characters
                </span>

              </div>

              <textarea
                id="job-description"
                rows={7}
                placeholder="Describe the project, requirements, expected outcome and anything freelancers should know..."
                value={form.description}
                disabled={loading}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-[10px] leading-4 text-neutral-400">
                A clear description helps you receive more relevant
                proposals.
              </p>

            </div>

            {/* =================================================
                BUDGET + JOB TYPE
            ================================================= */}

            <div className="grid gap-5 sm:grid-cols-2">

              {/* Budget */}

              <div>

                <label
                  htmlFor="budget"
                  className="mb-2 block text-xs font-semibold text-neutral-800"
                >
                  Budget
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400">
                    $
                  </span>

                  <input
                    id="budget"
                    type="number"
                    min="0"
                    placeholder="1000"
                    value={form.budget}
                    disabled={loading}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        budget: e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

                <p className="mt-2 text-[10px] text-neutral-400">
                  Set the maximum project budget.
                </p>

              </div>

              {/* Job Type */}

              <div>

                <label
                  htmlFor="job-type"
                  className="mb-2 block text-xs font-semibold text-neutral-800"
                >
                  Job Type
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">

                  <select
                    id="job-type"
                    value={form.jobType}
                    disabled={loading}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        jobType: e.target.value,
                      })
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 pr-10 text-sm text-neutral-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      Select Job Type
                    </option>

                    <option value="FIXED">
                      Fixed Price
                    </option>

                    <option value="HOURLY">
                      Hourly
                    </option>
                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                    ▼
                  </span>

                </div>

                <p className="mt-2 text-[10px] text-neutral-400">
                  Choose how the freelancer will be paid.
                </p>

              </div>

            </div>

            {/* =================================================
                DEADLINE
            ================================================= */}

            <div>

              <label
                htmlFor="deadline"
                className="mb-2 block text-xs font-semibold text-neutral-800"
              >
                Project Deadline
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="deadline"
                type="date"
                value={form.deadline}
                disabled={loading}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deadline: e.target.value,
                  })
                }
                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-[10px] text-neutral-400">
                When would you like the project to be completed?
              </p>

            </div>

            {/* =================================================
                PROJECT PREVIEW
            ================================================= */}

            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold text-white">
                  {form.title
                    ? form.title.charAt(0).toUpperCase()
                    : "J"}
                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {form.title || "Your Job Title"}
                  </p>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">
                    {form.description ||
                      "Your job description will appear here."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {form.budget && (
                      <span className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-medium text-neutral-500">
                        ${form.budget}
                      </span>
                    )}

                    {form.jobType && (
                      <span className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-medium text-neutral-500">
                        {form.jobType === "FIXED"
                          ? "Fixed Price"
                          : "Hourly"}
                      </span>
                    )}

                    {form.deadline && (
                      <span className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-medium text-neutral-500">
                        Deadline: {form.deadline}
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

                  Posting Job...
                </>
              ) : (
                <>
                  Post Job
                  <span>→</span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] leading-4 text-neutral-400">
              Your job will be published for freelancers to discover
              and apply.
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}