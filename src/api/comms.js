import client from "./client";

export async function listAnnouncements(params) {
  const { data } = await client.get("/comms/announcements", { params }); // { page, limit }
  return data; // { announcements, total, page, limit }
}

export async function createAnnouncement(payload) {
  const { data } = await client.post("/comms/announcements", payload); // { title, body }
  return data; // { announcement }
}

export async function getMyNotifications(params) {
  const { data } = await client.get("/comms/notifications", { params }); // { unreadOnly }
  return data; // { notifications, unreadCount }
}

export async function markNotificationRead(id) {
  const { data } = await client.put(`/comms/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await client.put("/comms/notifications/read-all");
  return data;
}