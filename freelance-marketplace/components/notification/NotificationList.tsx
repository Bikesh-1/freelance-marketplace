"use client";

import { useMemo } from "react";

import { useNotificationInfinite } from "@/hooks/useNotificationInfinite";
import NotificationItem from "./NotificationItem";

import { markNotificationsRead } from "@/services/notification.service";

export default function NotificationList({
  userId,
}: {
  userId: string;
}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } =
    useNotificationInfinite(userId);

  const notifications =
    useMemo(
      () =>
        data?.pages.flatMap(
          (
            page
          ) =>
            page.notifications
        ) || [],
      [data]
    );

  const markAll = async () => {
    await markNotificationsRead(
      userId
    );

    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={markAll}
          className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
        >
          Mark All Read
        </button>
      </div>

      {notifications.map(
        (
          notification: any
        ) => (
          <NotificationItem
            key={
              notification.id
            }
            notification={
              notification
            }
          />
        )
      )}

      {hasNextPage && (
        <button
          onClick={() =>
            fetchNextPage()
          }
          disabled={
            isFetchingNextPage
          }
          className="w-full rounded-lg bg-indigo-600 py-3 text-white hover:bg-indigo-500"
        >
          {isFetchingNextPage
            ? "Loading..."
            : "Load More"}
        </button>
      )}
    </div>
  );
}