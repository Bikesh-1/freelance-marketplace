import axios from "axios";

export type MessageRecord = {
  id: string;
  jobId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender: { id: string; name: string };
};

export type JobMessagesResponse = {
  messages: MessageRecord[];
  receiverId: string | null;
};

export async function getMessages(jobId: string): Promise<JobMessagesResponse> {
  const { data } = await axios.get<JobMessagesResponse>(`/api/messages/${encodeURIComponent(jobId)}`);
  return data;
}

export async function saveMessage(payload: {
  jobId: string;
  receiverId: string;
  content: string;
}) {
  const { data } = await axios.post("/api/messages", payload);
  return data.message as MessageRecord;
}
