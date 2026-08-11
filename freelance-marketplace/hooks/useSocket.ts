"use client";

import { useEffect } from "react";

import { socket } from "@/lib/socket/client";

export function useSocket(
  jobId: string,
  userId: string
) {
  useEffect(() => {
    if (
      !jobId ||
      !userId
    )
      return;

    if (
      !socket.connected
    ) {
      socket.connect();
    }

    socket.emit(
      "join-job",
      {
        jobId,
        userId,
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [jobId, userId]);

  return socket;
}