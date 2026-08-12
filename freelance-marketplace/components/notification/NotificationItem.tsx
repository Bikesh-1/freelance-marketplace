"use client";

import { markNotificationRead } from "@/services/notification.service";

interface NotificationData {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
}

export default function NotificationItem({
  notification,
}: {
  notification: NotificationData;
}) {
  const handleRead = async () => {
    if (
      notification.isRead
    )
      return;

    await markNotificationRead(
      notification.id
    );

    window.location.reload();
  };

  return (
    <div
      onClick={handleRead}
      className={`cursor-pointer rounded-2xl border border-slate-800 p-5 transition ${
        notification.isRead
          ? "bg-slate-900"
          : "bg-slate-800/50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">
            {
              notification.title
            }
          </h3>

          <p className="mt-1 text-slate-400">
            {
              notification.message
            }
          </p>
        </div>

        {!notification.isRead && (
          <div className="h-3 w-3 rounded-full bg-blue-500" />
        )}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {new Date(
          notification.createdAt
        ).toLocaleString()}
      </p>
    </div>
  );
}