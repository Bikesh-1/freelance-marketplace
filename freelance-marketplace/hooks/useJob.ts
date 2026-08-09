import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getJob = async (jobId: string) => {
  const { data } = await axios.get(`/api/jobs/${jobId}`);
  return data;
};

export const useJob = (jobId: string) => {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJob(jobId),
    enabled: !!jobId,
  });
};