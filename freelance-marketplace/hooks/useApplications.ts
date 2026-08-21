import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getApplications = async (jobId: string) => {
  const { data } = await axios.get(
    `/api/jobs/${jobId}/applications`
  );

  return data;
};

export const useApplications = (
  jobId: string
) => {
  return useQuery({
    queryKey: ["applications", jobId],
    queryFn: () =>
      getApplications(jobId),
    enabled: !!jobId,
  });
};