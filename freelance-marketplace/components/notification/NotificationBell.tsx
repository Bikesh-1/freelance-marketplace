"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket/client";
import { useNotifications } from "@/hooks/useNotifications";
import { markNotificationRead, markNotificationsRead } from "@/services/notification.service";
import { toast } from "sonner";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string | Date;
};

type NotificationResponse = {
  notifications: NotificationItem[];
  nextCursor?: string | null;
};

export default function NotificationBell() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "";
  const { data } = useNotifications(userId);
  const [open, setOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const queryClient = useQueryClient();

  const notificationItems = (data as NotificationResponse | undefined)?.notifications ?? [];
  const unread = notificationItems.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    if (!userId) return;

    if (!socket.connected) socket.connect();
    socket.emit("join-user", { userId });

    const onNotification = (notification: NotificationItem) => {
      queryClient.setQueryData<NotificationResponse>(["notifications", userId], (old) => ({
        notifications: [
          notification,
          ...(old?.notifications ?? []).filter((item) => item.id !== notification.id),
        ].slice(0, 10),
        nextCursor: old?.nextCursor ?? null,
      }));

      toast.success(notification.title, { description: notification.message });
    };

    socket.on("receive-notification", onNotification);
    return () => {
      socket.off("receive-notification", onNotification);
    };
  }, [userId, queryClient]);

  const handleRead = async (notification: NotificationItem) => {
    if (notification.isRead) return;
    try {
      await markNotificationRead(notification.id);
      queryClient.setQueryData<NotificationResponse>(["notifications", userId], (old) => ({
        notifications: (old?.notifications ?? []).map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item
        ),
        nextCursor: old?.nextCursor ?? null,
      }));
    } catch {
      toast.error("Could not update notification. Please try again.");
    }
  };

  const handleMarkAllRead = async () => {
    if (!userId || unread === 0) return;
    setMarkingAll(true);
    try {
      await markNotificationsRead(userId);
      queryClient.setQueryData<NotificationResponse>(["notifications", userId], (old) => ({
        notifications: (old?.notifications ?? []).map((item) => ({ ...item, isRead: true })),
        nextCursor: old?.nextCursor ?? null,
      }));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Could not mark notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-full p-2 transition hover:bg-slate-800"
      >
        <Bell className="h-6 w-6 text-white" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <section className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
              <div>
                <h3 className="text-base font-semibold text-slate-950">Notifications</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {unread === 0 ? "You're all caught up" : `${unread} unread update${unread === 1 ? "" : "s"}`}
                </p>
              </div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <CheckCheck className="h-4 w-4" />
                  {markingAll ? "Saving..." : "Mark all read"}
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notificationItems.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-500">No notifications yet.</p>
              ) : (
                notificationItems.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleRead(notification)}
                    className={`block w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${notification.isRead ? "bg-white" : "bg-red-50/60"}`}
                  >
                    <span className="flex items-start gap-2">
                      {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-900">{notification.title}</span>
                        <span className="mt-1 block text-sm leading-5 text-slate-600">{notification.message}</span>
                        {notification.createdAt && (
                          <span className="mt-2 block text-[11px] text-slate-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-slate-100 p-3 text-center text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              View all notifications
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
