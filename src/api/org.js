import client from "./client";

/* Settings */
export async function getSettings() {
  const { data } = await client.get("/org/settings");
  return data; // { settings }
}
export async function updateSettings(payload) {
  const { data } = await client.put("/org/settings", payload);
  return data; // { settings }
}

/* Departments */
export async function listDepartments() {
  const { data } = await client.get("/org/departments");
  return data; // { departments }
}
export async function createDepartment(payload) {
  const { data } = await client.post("/org/departments", payload);
  return data;
}
export async function updateDepartment(id, payload) {
  const { data } = await client.put(`/org/departments/${id}`, payload);
  return data;
}

/* Designations */
export async function listDesignations() {
  const { data } = await client.get("/org/designations");
  return data; // { designations }
}
export async function createDesignation(payload) {
  const { data } = await client.post("/org/designations", payload);
  return data;
}
export async function updateDesignation(id, payload) {
  const { data } = await client.put(`/org/designations/${id}`, payload);
  return data;
}

/* Leave types */
export async function listLeaveTypes() {
  const { data } = await client.get("/org/leave-types");
  return data; // { leaveTypes }
}
export async function upsertLeaveType(payload) {
  const { data } = await client.put("/org/leave-types", payload);
  return data;
}

/* Holidays */
export async function listHolidays(params) {
  const { data } = await client.get("/org/holidays", { params });
  return data; // { holidays }
}
export async function createHoliday(payload) {
  const { data } = await client.post("/org/holidays", payload);
  return data;
}
export async function deleteHoliday(id) {
  const { data } = await client.delete(`/org/holidays/${id}`);
  return data;
}