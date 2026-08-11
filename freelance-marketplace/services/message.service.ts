import axios from "axios";

export async function getMessages(
  jobId: string
) {
  const { data } =
    await axios.get(
      `/api/messages/${jobId}`
    );

  return data.messages;
}

export async function saveMessage(
  payload: {
    jobId: string;
    senderId: string;
    content: string;
  }
) {
  const { data } =
    await axios.post(
      "/api/messages",
      payload
    );

  return data.message;
}