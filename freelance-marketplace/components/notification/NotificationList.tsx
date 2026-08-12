"use client";

import { useEffect, useMemo, useRef } from "react";

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
  const loadMoreRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !loadMoreRef.current ||
      !hasNextPage
    )
      return;

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries[0]
              .isIntersecting
          ) {
            fetchNextPage();
          }
        }
      );

    observer.observe(
      loadMoreRef.current
    );

    return () =>
      observer.disconnect();
  }, [
    hasNextPage,
    fetchNextPage,
  ]);
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
        <div
          ref={loadMoreRef}
          className="h-10 flex items-center justify-center text-slate-400"
        >
          {isFetchingNextPage
            ? "Loading..."
            : "Scroll for more"}
        </div>
      )}
    </div>
  );
}