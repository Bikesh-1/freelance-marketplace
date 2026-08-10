import axios from "axios";

export async function submitMilestone(
  milestoneId: string
) {
  const { data } =
    await axios.post(
      `/api/milestone/${milestoneId}/submit`
    );

  return data.milestone;
}

export async function approveMilestone(
  milestoneId: string
) {
  const { data } =
    await axios.post(
      `/api/milestone/${milestoneId}/approve`
    );

  return data.milestone;
}