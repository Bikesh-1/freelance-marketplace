"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

import { useSocket } from "@/hooks/useSocket";
import { useMessages } from "@/hooks/useMessages";

export default function ChatRoom({
  jobId,
}: {
  jobId: string;
}) {
  const { data: session } = useSession();

  const userId = session?.user?.id || "";

  const socket = useSocket(jobId, userId);

  const queryClient = useQueryClient();

  const { data: messages } = useMessages(jobId);
  const [onlineUsers, setOnlineUsers,] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const otherUserId =
    messages?.find(
      (m: any) =>
        m.senderId !==
        userId
    )?.senderId || "";

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  useEffect(() => {
    socket.on(
      "online-users",
      (users: string[]) => {
        setOnlineUsers(users);
      }
    );

    return () => {
      socket.off(
        "online-users"
      );
    };
  }, [socket]);
  // Mark messages as read when chat opens
  useEffect(() => {
    if (!jobId || !userId) return;

    const markRead = async () => {
      try {
        await axios.post(
          "/api/messages/read",
          {
            jobId,
            receiverId: userId,
          }
        );

        socket.emit(
          "messages-read",
          {
            jobId,
            userId,
          }
        );

        // Update TanStack cache
        queryClient.setQueryData(
          [
            "messages",
            jobId,
          ],
          (
            old: any[] = []
          ) =>
            old.map(
              (msg) =>
                msg.receiverId ===
                  userId &&
                  !msg.isRead
                  ? {
                    ...msg,
                    isRead: true,
                    readAt:
                      new Date().toISOString(),
                  }
                  : msg
            )
        );
      } catch (error) {
        console.error(error);
      }
    };

    markRead();
  }, [
    jobId,
    userId,
    socket,
    queryClient,
  ]);

  // Socket listeners
  useEffect(() => {
    socket.on(
      "receive-message",
      (msg) => {
        queryClient.setQueryData(
          [
            "messages",
            jobId,
          ],
          (
            old: any[] = []
          ) => [
              ...old,
              msg,
            ]
        );
      }
    );

    socket.on(
      "typing",
      ({ userId }) => {
        setTypingUser(
          userId
        );
      }
    );

    socket.on(
      "stop-typing",
      () => {
        setTypingUser(
          ""
        );
      }
    );

    socket.on(
      "messages-read",
      ({ userId }) => {
        queryClient.setQueryData(
          [
            "messages",
            jobId,
          ],
          (
            old: any[] = []
          ) =>
            old.map(
              (msg) =>
                msg.senderId ===
                  userId
                  ? {
                    ...msg,
                    isRead: true,
                  }
                  : msg
            )
        );
      }
    );

    return () => {
      socket.off(
        "receive-message"
      );
      socket.off(
        "typing"
      );
      socket.off(
        "stop-typing"
      );
      socket.off(
        "messages-read"
      );
    };
  }, [
    socket,
    queryClient,
    jobId,
  ]);

  const sendMessage = () => {
    if (!message.trim())
      return;

    socket.emit(
      "send-message",
      {
        jobId,
        userId,
        content: message,
      }
    );

    setMessage("");
  };

  const handleTyping = (
    value: string
  ) => {
    setMessage(value);

    socket.emit(
      "typing",
      {
        jobId,
        userId,
      }
    );

    setTimeout(() => {
      socket.emit(
        "stop-typing",
        {
          jobId,
          userId,
        }
      );
    }, 1000);
  };

  return (
    <div className="flex h-[600px] flex-col rounded-2xl border border-slate-800 bg-slate-900">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages?.map(
          (msg: any) => (
            <div
              key={msg.id}
              className={`max-w-[75%] rounded-xl px-4 py-3 ${msg.senderId ===
                  userId
                  ? "ml-auto bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-100"
                }`}
            >
              <p className="text-xs opacity-70 mb-1">
                {
                  msg.sender
                    ?.name
                }
              </p>

              <p>
                {msg.content}
              </p>

              {msg.senderId ===
                userId && (
                  <p className="mt-1 text-[10px] opacity-70">
                    {msg.isRead
                      ? "Seen"
                      : "Sent"}
                  </p>
                )}
            </div>
          )
        )}

        {typingUser && (
          <p className="text-sm text-slate-400">
            Someone is typing...
          </p>
        )}

        <div ref={bottomRef} />
      </div>
      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Conversation
          </h2>

          <div className="mt-1 flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${onlineUsers.includes(
                otherUserId
              )
                  ? "bg-green-500"
                  : "bg-slate-600"
                }`}
            />

            <span className="text-sm text-slate-400">
              {onlineUsers.includes(
                otherUserId
              )
                ? "Online"
                : "Offline"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 border-t border-slate-800 p-4">
        <input
          value={message}
          onChange={(e) =>
            handleTyping(
              e.target.value
            )
          }
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-indigo-500"
          placeholder="Type a message..."
        />

        <button
          onClick={sendMessage}
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500"
        >
          Send
        </button>
      </div>
    </div>
  );
}