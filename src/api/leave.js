import client from "./client";

export async function getBalance(params) {
  const { data } = await client.get("/leave/balance", { params }); // { year }
  return data; // { year, balance }
}

export async function getMyLeaves() {
  const { data } = await client.get("/leave/me");
  return data; // { leaves }
}

export async function applyLeave(payload) {
  const { data } = await client.post("/leave", payload); // { leaveType, startDate, endDate, reason, source? }
  return data; // { leave }
}

export async function cancelLeave(id) {
  const { data } = await client.delete(`/leave/${id}`);
  return data; // { leave }
}

export async function getInbox() {
  const { data } = await client.get("/leave/inbox");
  return data; // { leaves }
}

export async function reviewLeave(id, payload) {
  const { data } = await client.put(`/leave/${id}/review`, payload); // { decision, comment }
  return data; // { leave }
}

export async function listLeaves(params) {
  const { data } = await client.get("/leave", { params }); // { status, employee }
  return data; // { leaves }
}