import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/services/message.service";

export function useMessages(
  jobId: string
) {
  return useQuery({
    queryKey: [
      "messages",
      jobId,
    ],

    queryFn: () =>
      getMessages(jobId),

    enabled: !!jobId,

    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  });
}