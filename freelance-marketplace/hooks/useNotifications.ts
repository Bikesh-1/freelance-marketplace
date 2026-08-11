import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/services/notification.service";

export function useNotifications(
  userId: string
) {
  return useQuery({
    queryKey: [
      "notifications",
      userId,
    ],

    queryFn: () =>
      getNotifications(userId),

    enabled: !!userId,

    staleTime: 1000 * 30,
  });
}