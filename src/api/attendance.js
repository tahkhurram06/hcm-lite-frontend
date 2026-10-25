import client from "./client";

export async function checkIn(payload = {}) {
  const { data } = await client.post("/attendance/checkin", payload); // { source?, location? }
  return data; // { attendance, late }
}

export async function checkOut(payload = {}) {
  const { data } = await client.post("/attendance/checkout", payload);
  return data; // { attendance }
}

export async function getMyAttendance(params) {
  const { data } = await client.get("/attendance/me", { params }); // { from, to }
  return data; // { attendance: [...] }
}

export async function getBoard(params) {
  const { data } = await client.get("/attendance/board", { params }); // { date, department }
  return data; // { date, board }
}

export async function requestCorrection(id, payload) {
  const { data } = await client.post(`/attendance/${id}/correction`, payload);
  return data; // { attendance }
}

export async function reviewCorrection(id, payload) {
  const { data } = await client.put(`/attendance/${id}/correction`, payload); // { decision, comment }
  return data; // { attendance }
}