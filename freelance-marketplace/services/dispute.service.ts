import axios from "axios";

export async function createDispute(
  payload: {
    milestoneId: string;
    userId: string;
    reason: string;
    evidence?: string;
  }
) {
  const { data } = await axios.post(
    "/api/dispute/create",
    payload
  );

  return data.dispute;
}

export async function getDisputes() {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/dispute`
  );

  return data.disputes;
}

export async function refundDispute(
  disputeId: string
) {
  const { data } = await axios.post(
    `/api/dispute/${disputeId}/refund`
  );

  return data;
}