import axios from "axios";

export async function getNotifications(
  userId: string,
  cursor?: string
) {
  const { data } =
    await axios.get(
      "/api/notifications",
      {
        params: {
          userId,
          cursor,
        },
      }
    );

  return data;
}

export async function markNotificationRead(
  notificationId: string
) {
  const { data } =
    await axios.post(
      `/api/notifications/${notificationId}/read`
    );

  return data.notification;
}

export async function markNotificationsRead(
  userId: string
) {
  const { data } =
    await axios.post(
      "/api/notifications/read",
      { userId }
    );

  return data;
}