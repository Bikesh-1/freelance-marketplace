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
      // The API stores the message; polling syncs both participants without requiring cross-origin socket cookies.
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
    <div className="flex h-[600px] flex-col rounded-2xl border border-slate-800 bg-slate-900">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading messages…</p>
        ) : isError ? (
          <p className="text-sm text-red-300">Could not load this conversation.</p>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">No messages yet. Start the conversation below.</p>
        ) : messages.map((msg) => (
          <div key={msg.id} className={`max-w-[75%] rounded-xl px-4 py-3 ${msg.senderId === userId ? "ml-auto bg-indigo-600 text-white" : "bg-slate-800 text-slate-100"}`}>
            <p className="mb-1 text-xs opacity-70">{msg.sender?.name ?? "User"}</p>
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            {msg.senderId === userId && <p className="mt-1 text-[10px] opacity-70">{msg.isRead ? "Seen" : "Sent"}</p>}
          </div>
        ))}
        {typingUser && <p className="text-sm text-slate-400">Someone is typing…</p>}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Conversation</h2>
          <div className="mt-1 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${otherUserId && onlineUsers.includes(otherUserId) ? "bg-green-500" : "bg-slate-600"}`} />
            <span className="text-sm text-slate-400">{otherUserId && onlineUsers.includes(otherUserId) ? "Online" : "Offline"}</span>
          </div>
        </div>
      </div>

      {error && <p role="alert" className="px-4 pt-3 text-sm text-red-300">{error}</p>}
      <form className="flex gap-3 border-t border-slate-800 p-4" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
        <input
          value={message}
          onChange={(event) => handleTyping(event.target.value)}
          maxLength={5000}
          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-indigo-500 disabled:opacity-60"
          placeholder="Type a message…"
          disabled={sending || !otherUserId}
        />
        <button type="submit" disabled={sending || !message.trim() || !otherUserId} className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
