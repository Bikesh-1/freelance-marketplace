import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/navbar";

export default async function MessagesPage() {
  const session = await getServerSession(
    authOptions
  );

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const messages =
    await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
          },
          {
            receiverId: userId,
          },
        ],
      },

      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },

        sender: {
          select: {
            id: true,
            name: true,
          },
        },

        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const conversations =
    new Map<
      string,
      (typeof messages)[number]
    >();

  for (const message of messages) {
    if (!conversations.has(message.jobId)) {
      conversations.set(
        message.jobId,
        message
      );
    }
  }

  const chats = Array.from(
    conversations.values()
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="mb-8">

            <div className="mb-3 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-red-500" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Inbox
              </span>

            </div>

            <div className="flex items-end justify-between gap-4">

              <div>

                <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                  Messages
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                  Your conversations with clients and freelancers.
                </p>

              </div>

              {chats.length > 0 && (
                <span className="hidden rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 shadow-sm sm:block">
                  {chats.length}{" "}
                  {chats.length === 1
                    ? "Conversation"
                    : "Conversations"}
                </span>
              )}

            </div>

          </div>

          {/* =====================================================
              EMPTY STATE
          ===================================================== */}

          {chats.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-400">
                💬
              </div>

              <h2 className="mt-5 text-lg font-semibold text-neutral-950">
                No conversations yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Your project conversations will appear here once
                you start chatting with another user.
              </p>

            </div>
          ) : (

            /* ===================================================
               CONVERSATIONS
            =================================================== */

            <div className="space-y-3">

              {chats.map((chat) => {

                const otherUser =
                  chat.senderId === userId
                    ? chat.receiver
                    : chat.sender;

                return (
                  <Link
                    key={chat.jobId}
                    href={`/message/${chat.jobId}`}
                    className="group block rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 hover:shadow-md sm:p-5"
                  >

                    <div className="flex items-center gap-4">

                      {/* Avatar */}

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold text-white">

                        {(
                          otherUser.name ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </div>

                      {/* Conversation */}

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h2 className="truncate text-sm font-bold text-neutral-950 group-hover:text-red-500 sm:text-base">
                                {chat.job.title}
                              </h2>

                              <span className="hidden rounded-full bg-red-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-red-500 sm:inline">
                                Chat
                              </span>

                            </div>

                            <p className="mt-1 text-xs font-medium text-neutral-500">
                              {otherUser.name ||
                                "User"}
                            </p>

                          </div>

                          <div className="flex shrink-0 items-center gap-2">

                            <span className="hidden text-[10px] text-neutral-400 sm:block">
                              {new Date(
                                chat.createdAt
                              ).toLocaleDateString()}
                            </span>

                            <span className="text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-red-500">
                              →
                            </span>

                          </div>

                        </div>

                        <p className="mt-2 line-clamp-1 text-xs leading-5 text-neutral-400 sm:text-sm">
                          {chat.content}
                        </p>

                      </div>

                    </div>

                    {/* Mobile Date */}

                    <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 sm:hidden">

                      <span className="text-[10px] text-neutral-400">
                        Last message
                      </span>

                      <span className="text-[10px] font-medium text-neutral-500">
                        {new Date(
                          chat.createdAt
                        ).toLocaleDateString()}
                      </span>

                    </div>

                  </Link>
                );
              })}

            </div>
          )}

        </div>
      </main>
    </>
  );
}