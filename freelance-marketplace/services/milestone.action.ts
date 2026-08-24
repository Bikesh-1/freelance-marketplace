import axios from "axios";

export async function submitMilestone(milestoneId: string,
  data: {
    submissionUrl: string;
    submissionNote?: string;
  }
) {
  const response = await fetch(
    `/api/milestone/${milestoneId}/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.error || "Failed to submit milestone"
    );
  }

  return response.json();
}



export async function approveMilestone(milestoneId: string) {
  const { data } = await axios.post(`/api/milestone/${milestoneId}/approve`);

  return data.milestone;
}