"use client";

import { useState } from "react";
import axios from "axios";

export default function ClientProfilePage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    country: "",
  });

  const submitHandler = async () => {
    try {
      setLoading(true);

      await axios.post("/api/profile/complete", form);

      window.location.href = "/client/dashboard";
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-10 text-neutral-900 sm:px-6 lg:py-16">

      <div className="mx-auto max-w-xl">

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
            Complete Client Profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Add your company information to complete your client
            profile and start posting projects.
          </p>

        </section>

        {/* =====================================================
            PROFILE CARD
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
                  Company Information
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  Tell freelancers a little about your company.
                </p>

              </div>

            </div>

          </div>

          <div className="space-y-6 p-5 sm:p-6">

            {/* =================================================
                COMPANY NAME
            ================================================= */}

            <div>

              <label
                htmlFor="company-name"
                className="mb-2 block text-xs font-semibold text-neutral-800"
              >
                Company Name
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="company-name"
                type="text"
                placeholder="e.g. Acme Technologies"
                value={form.companyName}
                disabled={loading}
                onChange={(e) =>
                  setForm({
                    ...form,
                    companyName: e.target.value,
                  })
                }
                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-[10px] text-neutral-400">
                This name will be visible to freelancers.
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
                <span className="ml-1 text-red-500">*</span>
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

              <p className="mt-2 text-[10px] text-neutral-400">
                Add the country where your company is based.
              </p>

            </div>

            {/* =================================================
                PROFILE PREVIEW
            ================================================= */}

            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold text-white">
                  {form.companyName
                    ? form.companyName
                        .charAt(0)
                        .toUpperCase()
                    : "C"}
                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {form.companyName || "Your Company Name"}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {form.country || "Your Country"}
                  </p>

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
                  Saving...
                </>
              ) : (
                <>
                  Save Profile
                  <span>→</span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] leading-4 text-neutral-400">
              You can update your profile information later from
              your account settings.
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}