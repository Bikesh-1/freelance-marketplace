"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Message = {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
};

export default function JobChatPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = params.jobId as string;

  const { data: session, status } = useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [receiverId, setReceiverId] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     AUTH REDIRECT
  ===================================================== */

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  /* =====================================================
     LOAD CHAT
  ===================================================== */

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !session?.user?.id ||
      !jobId
    ) {
      return;
    }

    let cancelled = false;

    const loadChat = async () => {
      try {
        setError("");

        const response = await fetch(
          `/api/messages/${jobId}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load messages"
          );
        }

        if (cancelled) return;

        setMessages(
          Array.isArray(data.messages)
            ? data.messages
            : []
        );

        if (data.receiverId) {
          setReceiverId(data.receiverId);
        }
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Load chat error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load chat"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadChat();

    return () => {
      cancelled = true;
    };
  }, [
    status,
    session?.user?.id,
    jobId,
  ]);

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const sendMessage = async () => {
    const trimmedContent =
      content.trim();

    if (!trimmedContent) return;

    if (!receiverId) {
      setError("Receiver not found");
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await fetch(
        "/api/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId,
            receiverId,
            content: trimmedContent,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to send message"
        );
      }

      if (data.message) {
        setMessages((previous) => [
          ...previous,
          data.message,
        ]);
      }

      setContent("");
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  /* =====================================================
     AUTH LOADING
  ===================================================== */

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8]">

        <div className="rounded-2xl border border-neutral-200 bg-white px-8 py-7 text-center shadow-sm">

          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50">

            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-100 border-t-red-500" />

          </div>

          <p className="mt-4 text-sm font-semibold text-neutral-800">
            Checking your session
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            Please wait a moment...
          </p>

        </div>

      </main>
    );
  }

  if (!session?.user) {
    return null;
  }

  /* =====================================================
     CHAT UI
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-3 py-4 sm:px-6 sm:py-6">

      <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-5xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm sm:h-[calc(100vh-3rem)]">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex items-center justify-between border-b border-neutral-100 px-4 py-4 sm:px-6">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <span className="text-sm font-bold">
                #
              </span>
            </div>

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-green-500" />

                <h1 className="truncate text-sm font-bold text-neutral-950 sm:text-base">
                  Project Chat
                </h1>

              </div>

              <p className="mt-1 truncate text-[10px] text-neutral-400">
                Job ID: {jobId}
              </p>

            </div>

          </div>

          <Link
            href={
              session.user.role === "CLIENT"
                ? `/client/jobs/${jobId}`
                : `/freelancer/jobs/${jobId}`
            }
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 sm:px-4"
          >
            <span className="hidden sm:inline">
              ← Back
            </span>

            <span className="sm:hidden">
              ←
            </span>
          </Link>

        </header>

        {/* =================================================
            MESSAGES
        ================================================= */}

        <div className="relative flex-1 overflow-y-auto bg-[#fafafa]">

          {loading ? (
            <div className="flex h-full items-center justify-center">

              <div className="text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-100">

                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-red-500" />

                </div>

                <p className="mt-4 text-sm font-medium text-neutral-700">
                  Loading messages...
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Opening your conversation
                </p>

              </div>

            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center px-6">

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm ring-1 ring-neutral-100">
                  💬
                </div>

                <h2 className="mt-5 text-sm font-semibold text-neutral-900">
                  No messages yet
                </h2>

                <p className="mt-1 max-w-xs text-xs leading-5 text-neutral-400">
                  Start the conversation with your
                  {session.user.role === "CLIENT"
                    ? " freelancer."
                    : " client."}
                </p>

              </div>

            </div>
          ) : (
            <div className="space-y-4 p-4 sm:p-6">

              {messages.map((message) => {

                const isMine =
                  message.senderId ===
                  session.user.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isMine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`max-w-[85%] sm:max-w-[70%] ${
                        isMine
                          ? "items-end"
                          : "items-start"
                      }`}
                    >

                      {!isMine && (
                        <p className="mb-1.5 ml-1 text-[10px] font-semibold text-neutral-500">
                          {message.sender.name}
                        </p>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          isMine
                            ? "rounded-br-md bg-red-500 text-white"
                            : "rounded-bl-md border border-neutral-200 bg-white text-neutral-800"
                        }`}
                      >

                        <p className="whitespace-pre-wrap text-sm leading-6">
                          {message.content}
                        </p>

                        <p
                          className={`mt-2 text-[9px] ${
                            isMine
                              ? "text-red-100"
                              : "text-neutral-400"
                          }`}
                        >
                          {new Date(
                            message.createdAt
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="border-t border-red-100 bg-red-50 px-4 py-3 sm:px-6">

            <div className="flex items-center gap-2">

              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                !
              </span>

              <p className="text-xs font-medium text-red-600">
                {error}
              </p>

            </div>

          </div>
        )}

        {/* =================================================
            INPUT
        ================================================= */}

        <div className="border-t border-neutral-100 bg-white p-3 sm:p-4">

          <div className="flex items-end gap-2 sm:gap-3">

            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              onKeyDown={(e) => {

                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  sendMessage();
                }

              }}
              placeholder="Write a message..."
              rows={2}
              disabled={sending}
              className="min-h-[48px] flex-1 resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              onClick={sendMessage}
              disabled={
                sending ||
                !content.trim() ||
                !receiverId
              }
              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
            >
              {sending ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  <span className="hidden sm:inline">
                    Sending...
                  </span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">
                    Send
                  </span>

                  <span className="text-base">
                    →
                  </span>
                </>
              )}
            </button>

          </div>

          <p className="mt-2 hidden text-[10px] text-neutral-400 sm:block">
            Press Enter to send · Shift + Enter for a new line
          </p>

        </div>

      </div>
    </main>
  );
}