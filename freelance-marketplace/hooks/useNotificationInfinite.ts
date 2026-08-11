import { useInfiniteQuery } from "@tanstack/react-query";

import { getNotifications } from "@/services/notification.service";

export function useNotificationInfinite(
  userId: string
) {
  return useInfiniteQuery({
    queryKey: [
      "notifications",
      userId,
    ],

    queryFn: ({
      pageParam,
    }) =>
      getNotifications(
        userId,
        pageParam
      ),

    enabled: !!userId,

    initialPageParam:
      undefined as
        | string
        | undefined,

    getNextPageParam: (
      lastPage
    ) =>
      lastPage.nextCursor,
  });
}