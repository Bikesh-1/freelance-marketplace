import axios from "axios";

export async function submitMilestone(
  milestoneId: string,
  payload: {
    submissionNote?: string;
    submissionUrl?: string;
  }
) {
  const { data } = await axios.post(
    `/api/milestone/${milestoneId}/submit`,
    payload
  );

  return data.milestone;
}

export async function approveMilestone(
  milestoneId: string
) {
  const { data } = await axios.post(
    `/api/milestone/${milestoneId}/approve`
  );

  return data.milestone;
}