"use client";

import { useState } from "react";
import axios from "axios";

export default function FreelancerProfilePage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    country: "",
    hourlyRate: 10,
    experienceLevel: "BEGINNER",
  });

  const submitHandler = async () => {
    try {
      setLoading(true);

      await axios.post("/api/profile/complete", form);

      window.location.href = "/freelancer/dashboard";
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-neutral-900 sm:px-6 lg:py-12">

      <div className="mx-auto max-w-2xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8">

          <div className="mb-3 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-red-500" />

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Freelancer Profile
            </span>

          </div>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Complete Your Profile
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
            Tell clients about yourself, your experience and your
            professional skills.
          </p>

        </div>

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
                  Professional Information
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  Add the details clients will see on your profile.
                </p>

              </div>

            </div>

          </div>

          <div className="space-y-6 p-5 sm:p-6">

            {/* =================================================
                FULL NAME
            ================================================= */}

            <div>

              <label
                htmlFor="fullName"
                className="mb-2 block text-xs font-semibold text-neutral-800"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                disabled={loading}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fullName: e.target.value,
                  })
                }
                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* =================================================
                BIO
            ================================================= */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="bio"
                  className="text-xs font-semibold text-neutral-800"
                >
                  Professional Bio
                </label>

                <span className="text-[10px] text-neutral-400">
                  {form.bio.length} characters
                </span>

              </div>

              <textarea
                id="bio"
                rows={6}
                placeholder="Tell clients about your experience, skills and the type of work you enjoy..."
                value={form.bio}
                disabled={loading}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bio: e.target.value,
                  })
                }
                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-[10px] leading-4 text-neutral-400">
                Keep your bio concise and focused on what you can offer
                clients.
              </p>

            </div>

            {/* =================================================
                COUNTRY
            ================================================= */}

            <div>

              <label
                htmlFor="country"
                className="mb-2 block text-xs font-semibold text-neutral-800"
              >
                Country
              </label>

              <input
                id="country"
                type="text"
                placeholder="e.g. India"
                value={form.country}
                disabled={loading}
                onChange={(e) =>
                  setForm({
                    ...form,
                    country: e.target.value,
                  })
                }
                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* =================================================
                RATE + EXPERIENCE
            ================================================= */}

            <div className="grid gap-5 sm:grid-cols-2">

              {/* Hourly Rate */}

              <div>

                <label
                  htmlFor="hourlyRate"
                  className="mb-2 block text-xs font-semibold text-neutral-800"
                >
                  Hourly Rate
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400">
                    $
                  </span>

                  <input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    placeholder="10"
                    value={form.hourlyRate}
                    disabled={loading}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        hourlyRate:
                          Number(e.target.value) || 0,
                      })
                    }
                    className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm font-medium text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

                <p className="mt-2 text-[10px] text-neutral-400">
                  Your preferred hourly rate.
                </p>

              </div>

              {/* Experience */}

              <div>

                <label
                  htmlFor="experienceLevel"
                  className="mb-2 block text-xs font-semibold text-neutral-800"
                >
                  Experience Level
                </label>

                <div className="relative">

                  <select
                    id="experienceLevel"
                    value={form.experienceLevel}
                    disabled={loading}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        experienceLevel: e.target.value,
                      })
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 pr-10 text-sm text-neutral-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="BEGINNER">
                      Beginner
                    </option>

                    <option value="INTERMEDIATE">
                      Intermediate
                    </option>

                    <option value="ADVANCED">
                      Advanced
                    </option>

                    <option value="EXPERT">
                      Expert
                    </option>
                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                    ▼
                  </span>

                </div>

                <p className="mt-2 text-[10px] text-neutral-400">
                  Choose your current experience level.
                </p>

              </div>

            </div>

            {/* =================================================
                PROFILE PREVIEW
            ================================================= */}

            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-bold text-white">
                  {form.fullName
                    ? form.fullName
                        .charAt(0)
                        .toUpperCase()
                    : "F"}
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-semibold text-neutral-900">
                    {form.fullName || "Your Name"}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">

                    <span>
                      {form.experienceLevel
                        .charAt(0)
                        .toUpperCase() +
                        form.experienceLevel
                          .slice(1)
                          .toLowerCase()}
                    </span>

                    <span className="text-neutral-300">
                      •
                    </span>

                    <span>
                      ${form.hourlyRate}/hr
                    </span>

                    {form.country && (
                      <>
                        <span className="text-neutral-300">
                          •
                        </span>

                        <span>
                          {form.country}
                        </span>
                      </>
                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                SAVE BUTTON
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
                  Saving Profile...
                </>
              ) : (
                <>
                  Save Profile
                  <span>→</span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] leading-4 text-neutral-400">
              You can update your profile details later from your
              freelancer account.
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}