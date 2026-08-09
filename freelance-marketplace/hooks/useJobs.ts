import { useQuery } from "@tanstack/react-query";
import { getJobs } from "@/services/job.service";

export const useJobs = (
  search: string,
  jobType: string,
  minBudget: number
) => {
  return useQuery({
    queryKey: ["jobs", search, jobType, minBudget],
    queryFn: () => getJobs(search, jobType, minBudget),
    staleTime: 1000 * 60 * 5,
  });
};