"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket/client";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationBell() {
    const { data: session } = useSession();

    const userId =
        session?.user?.id || "";

    const {
        data: notifications,
    } =
        useNotifications(userId);

    const [open, setOpen] =
        useState(false);

    const unread =
        notifications?.filter(
            (n: any) =>
                !n.isRead
        ).length || 0;

    const queryClient =
        useQueryClient();

    useEffect(() => {
        if (!userId) return;

        if (!socket.connected) {
            socket.connect();
        }

        socket.emit(
            "join-user",
            { userId }
        );

        socket.on(
            "receive-notification",
            (notification) => {
                queryClient.setQueryData(
                    [
                        "notifications",
                        userId,
                    ],
                    (
                        old: any[] = []
                    ) => [
                            notification,
                            ...old,
                        ]
                );
            }
        );

        return () => {
            socket.off(
                "receive-notification"
            );
        };
    }, [
        userId,
        queryClient,
    ]);

    return (
        <div className="relative">
            <button
                onClick={() =>
                    setOpen(!open)
                }
                className="relative rounded-full p-2 hover:bg-slate-800"
            >
                <Bell className="h-6 w-6 text-white" />

                {unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-96 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
                    <div className="border-b border-slate-800 p-4">
                        <h3 className="text-lg font-semibold text-white">
                            Notifications
                        </h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications?.length ===
                            0 ? (
                            <p className="p-4 text-slate-400">
                                No notifications
                            </p>
                        ) : (
                            notifications?.map(
                                (
                                    n: any
                                ) => (
                                    <div
                                        key={n.id}
                                        className={`border-b border-slate-800 p-4 ${!n.isRead
                                                ? "bg-slate-800/40"
                                                : ""
                                            }`}
                                    >
                                        <h4 className="font-medium text-white">
                                            {n.title}
                                        </h4>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {n.message}
                                        </p>
                                    </div>
                                )
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}