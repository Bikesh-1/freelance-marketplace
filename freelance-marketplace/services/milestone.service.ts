import axios from "axios";

export async function getMilestones(jobId: string) {
  const { data } = await axios.get(
    `/api/jobs/${jobId}/milestones`
  );

  return data.milestones;
}

export async function createMilestone(
  jobId: string,
  payload: {
    title: string;
    description?: string;
    amount: number;
    dueDate?: string;
    order: number;
  }
) {
  const { data } = await axios.post(
    `/api/jobs/${jobId}/milestone/create`,
    payload
  );

  return data.milestone;
}