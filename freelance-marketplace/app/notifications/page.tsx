"use client";

import { useSession } from "next-auth/react";

import NotificationList from "@/components/notification/NotificationList";

export default function NotificationsPage() {
  const { data: session } =
    useSession();

  const userId =
    session?.user?.id || "";

  return (
    <main className="min-h-screen bg-slate-950 p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold text-white">
          Notifications
        </h1>

        <NotificationList userId={userId} />
      </div>
    </main>
  );
}