import axios from "axios";

export async function getAdminDisputes() {
  const { data } =
    await axios.get(
      "/api/admin/disputes"
    );

  return data.disputes;
}

export async function resolveDispute(
  disputeId: string,
  decision:
    | "CLIENT_WON"
    | "FREELANCER_WON",
  note?: string
) {
  const { data } =
    await axios.post(
      `/api/admin/disputes/${disputeId}/resolve`,
      {
        decision,
        note,
      }
    );

  return data;
}

export async function createDispute(
  payload: {
    milestoneId: string;
    reason: string;
    evidence?: string;
  }
) {
  const { data } =
    await axios.post(
      "/api/dispute/create",
      payload
    );

  return data.dispute;
}