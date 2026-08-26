"use client";

import { useSession } from "next-auth/react";

import NotificationList from "@/components/notification/NotificationList";

export default function NotificationsPage() {
  const { data: session } = useSession();

  const userId = session?.user?.id || "";

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-neutral-900">

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mb-8">

          <div className="mb-3 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-red-500" />

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Activity Center
            </span>

          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                Notifications
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                Stay updated with important activity, project updates
                and account notifications.
              </p>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 shadow-sm">
              🔔
            </div>

          </div>

        </section>

        {/* =====================================================
            NOTIFICATION CARD
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">

          {/* Card Header */}

          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">

            <div>

              <h2 className="text-sm font-semibold text-neutral-950">
                Recent Activity
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                Your latest notifications
              </p>

            </div>

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Updates
            </span>

          </div>

          {/* Notification List */}

          <div className="p-4 sm:p-5">

            <NotificationList userId={userId} />

          </div>

        </section>

      </div>

    </main>
  );
}