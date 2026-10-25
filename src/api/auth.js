import client from "./client";

export async function getSetupStatus() {
  const { data } = await client.get("/auth/setup-status");
  return data; // { setupComplete }
}

export async function setupAdmin({ companyName, name, email, password }) {
  const { data } = await client.post("/auth/setup", { companyName, name, email, password });
  return data; // { token, user }
}

export async function login({ email, password }) {
  const { data } = await client.post("/auth/login", { email, password });
  return data; // { token, user }
}

export async function getMe() {
  const { data } = await client.get("/auth/me");
  return data; // { user }
}

// NOTE: there's no dedicated change-password endpoint in authController.js
// yet (only resetUserPassword, which is Admin-only and resets *someone else's*
// password). ChangePassword.jsx calls this — you'll need to add a
// PUT /api/auth/change-password route + controller that checks the current
// password and updates req.user's own password. Wiring the frontend call
// now so it's ready the moment that endpoint exists.
export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await client.put("/auth/change-password", { currentPassword, newPassword });
  return data;
}

export async function listUsers(params) {
  const { data } = await client.get("/auth/users", { params });
  return data; // { users }
}

export async function createHrUser({ name, email }) {
  const { data } = await client.post("/auth/hr", { name, email });
  return data; // { user, temporaryPassword }
}

export async function deactivateUser(id) {
  const { data } = await client.put(`/auth/users/${id}/deactivate`);
  return data;
}

export async function reactivateUser(id) {
  const { data } = await client.put(`/auth/users/${id}/reactivate`);
  return data;
}

export async function resetUserPassword(id) {
  const { data } = await client.put(`/auth/users/${id}/reset-password`);
  return data; // { temporaryPassword }
}