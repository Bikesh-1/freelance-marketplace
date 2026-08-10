import { useQuery } from "@tanstack/react-query";

import { getMilestones } from "@/services/milestone.service";

export function useMilestones(
  jobId: string
) {
  return useQuery({
    queryKey: [
      "milestones",
      jobId,
    ],

    queryFn: () =>
      getMilestones(jobId),

    enabled: !!jobId,

    staleTime: 1000 * 60 * 5,
  });
}