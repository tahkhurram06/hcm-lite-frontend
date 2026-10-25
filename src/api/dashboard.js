import client from "./client";

export async function getAdminDashboard(params) {
  const { data } = await client.get("/dashboard/admin", { params }); // { from, to, department }
  return data;
}

export async function getHrDashboard(params) {
  const { data } = await client.get("/dashboard/hr", { params });
  return data;
}

export async function getEmployeeDashboard() {
  const { data } = await client.get("/dashboard/employee");
  return data;
}