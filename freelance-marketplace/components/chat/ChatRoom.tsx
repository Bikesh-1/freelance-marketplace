"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

import { useSocket } from "@/hooks/useSocket";
import { useMessages } from "@/hooks/useMessages";
import type { JobMessagesResponse, MessageRecord } from "@/services/message.service";

export default function ChatRoom({ jobId }: { jobId: string }) {
  const { data: session } = useSession();
  const userId = session?.user?.id || "";
  const socket = useSocket(jobId, userId);
  const queryClient = useQueryClient();
  const { data: chatData, isLoading, isError } = useMessages(jobId);
  const messages = chatData?.messages ?? [];
  const otherUserId = chatData?.receiverId ?? "";

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const onOnlineUsers = (users: string[]) => setOnlineUsers(users);
    const onReceiveMessage = (incoming: MessageRecord) => {
      if (incoming.jobId !== jobId) return;
      if (incoming.senderId === userId) setSending(false);
      queryClient.setQueryData<JobMessagesResponse>(["messages", jobId], (old) => {
        if (!old) return { messages: [incoming], receiverId: incoming.senderId === userId ? incoming.receiverId : incoming.senderId };
        if (old.messages.some((item) => item.id === incoming.id)) return old;
        return { ...old, messages: [...old.messages, incoming] };
      });

      if (incoming.receiverId === userId) {
        void axios.post("/api/messages/read", { jobId }).catch((readError) => {
          console.error("Mark incoming message as read error:", readError);
        });
      }
    };
    const onTyping = ({ userId: typingUserId }: { userId: string }) => {
      if (typingUserId !== userId) setTypingUser(typingUserId);
    };
    const onStopTyping = () => setTypingUser("");
    const onMessagesRead = ({ userId: readerId }: { userId: string }) => {
      queryClient.setQueryData<JobMessagesResponse>(["messages", jobId], (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: old.messages.map((item) =>
            item.senderId === userId && item.receiverId === readerId
              ? { ...item, isRead: true, readAt: new Date().toISOString() }
              : item
          ),
        };
      });
    };
    const onMessageError = ({ message: errorMessage }: { message: string }) => {
      setError(errorMessage || "Message could not be sent.");
      setSending(false);
    };

    socket.on("online-users", onOnlineUsers);
    socket.on("receive-message", onReceiveMessage);
    socket.on("typing", onTyping);
    socket.on("stop-typing", onStopTyping);
    socket.on("messages-read", onMessagesRead);
    socket.on("message-error", onMessageError);

    return () => {
      socket.off("online-users", onOnlineUsers);
      socket.off("receive-message", onReceiveMessage);
      socket.off("typing", onTyping);
      socket.off("stop-typing", onStopTyping);
      socket.off("messages-read", onMessagesRead);
      socket.off("message-error", onMessageError);
    };
  }, [socket, queryClient, jobId, userId]);

  useEffect(() => {
    if (!jobId || !userId) return;
    axios.post("/api/messages/read", { jobId }).then(() => {
      queryClient.setQueryData<JobMessagesResponse>(["messages", jobId], (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: old.messages.map((item) =>
            item.receiverId === userId && !item.isRead
              ? { ...item, isRead: true, readAt: new Date().toISOString() }
              : item
          ),
        };
      });
      socket.emit("messages-read", { jobId });
    }).catch((readError) => {
      console.error("Mark messages read error:", readError);
    });
  }, [jobId, userId, socket, queryClient]);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed || sending || !jobId) return;
    if (!otherUserId) {
      setError("This job does not have another assigned participant yet.");
      return;
    }
    setError("");
    setSending(true);
    void axios.post("/api/messages", {
      jobId,
      receiverId: otherUserId,
      content: trimmed,
    }).then(({ data }) => {
      const saved = data.message as MessageRecord;
      queryClient.setQueryData<JobMessagesResponse>(["messages", jobId], (old) => {
        if (!old) return { messages: [saved], receiverId: otherUserId };
        if (old.messages.some((item) => item.id === saved.id)) return old;
        return { ...old, messages: [...old.messages, saved] };
      });
      setMessage("");
      // The API has already persisted this message. Ask the authenticated socket server
      // to broadcast that existing record to both participants (without creating a duplicate).
      if (socket.connected) {
        socket.emit("message-created", { jobId, messageId: saved.id });
      }
    }).catch((sendError) => {
      const messageText = axios.isAxiosError(sendError)
        ? String(sendError.response?.data?.message || sendError.message)
        : "Message could not be sent. Please try again.";
      setError(messageText);
    }).finally(() => setSending(false));
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    if (!jobId || !socket.connected) return;
    socket.emit("typing", { jobId });
    window.setTimeout(() => socket.emit("stop-typing", { jobId }), 800);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-neutral-100 bg-neutral-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Project workspace</p>
          <h2 className="mt-1 text-lg font-bold">Conversation</h2>
          <div className="mt-2 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${otherUserId && onlineUsers.includes(otherUserId) ? "bg-emerald-400" : "bg-neutral-500"}`} />
            <span className="text-xs text-neutral-400">{otherUserId && onlineUsers.includes(otherUserId) ? "Online" : "Chat available"}</span>
          </div>
        </div>
        <span className="w-fit rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-300">
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </span>
      </header>

      <div className="flex h-[min(62vh,620px)] min-h-[360px] flex-col bg-[#fbfbfc]">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-neutral-400">Loading conversation…</p>
            </div>
          ) : isError ? (
            <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              Could not load this conversation. Please refresh and try again.
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-2xl text-red-500 shadow-sm">✉</div>
              <p className="mt-4 text-sm font-semibold text-neutral-800">Start the conversation</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-neutral-500">Send a message to discuss project details, milestones, or updates.</p>
            </div>
          ) : messages.map((msg) => {
            const ownMessage = msg.senderId === userId;
            return (
              <div key={msg.id} className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${ownMessage ? "rounded-br-md bg-red-500 text-white" : "rounded-bl-md border border-neutral-200 bg-white text-neutral-800"}`}>
                  <p className={`mb-1 text-[10px] font-semibold uppercase tracking-wide ${ownMessage ? "text-red-100" : "text-neutral-400"}`}>
                    {ownMessage ? "You" : (msg.sender?.name ?? "Client")}
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">{msg.content}</p>
                  <p className={`mt-2 text-right text-[10px] ${ownMessage ? "text-red-100" : "text-neutral-400"}`}>
                    {ownMessage ? (msg.isRead ? "Seen" : "Sent") : ""}
                  </p>
                </div>
              </div>
            );
          })}
          {typingUser && <p className="text-xs text-neutral-400">Someone is typing…</p>}
          <div ref={bottomRef} />
        </div>

        {error && <p role="alert" className="mx-4 mb-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600 sm:mx-6">{error}</p>}
        <form className="border-t border-neutral-200 bg-white p-3 sm:p-4" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
          <div className="flex items-end gap-2 sm:gap-3">
            <input
              value={message}
              onChange={(event) => handleTyping(event.target.value)}
              maxLength={5000}
              className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:opacity-60"
              placeholder={otherUserId ? "Write your message…" : "No assigned participant yet"}
              disabled={sending || !otherUserId}
            />
            <button type="submit" disabled={sending || !message.trim() || !otherUserId} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5">
              {sending ? "Sending…" : "Send"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <p className="mt-2 px-1 text-[10px] text-neutral-400">Keep project communication clear and professional.</p>
        </form>
      </div>
    </section>
  );
}
