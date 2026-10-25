import client from "./client";

export async function registerEmployee(payload) {
  const { data } = await client.post("/employees", payload);
  return data; // { employee, temporaryPassword }
}

export async function listEmployees(params) {
  const { data } = await client.get("/employees", { params }); // { search, department, page, limit }
  return data; // { employees, total, page, limit }
}

export async function getEmployee(id) {
  const { data } = await client.get(`/employees/${id}`);
  return data; // { employee }
}

export async function updateEmployee(id, payload) {
  const { data } = await client.put(`/employees/${id}`, payload);
  return data; // { employee }
}

export async function dryRunImportEmployees(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await client.post("/employees/import/dry-run", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { totalRows, validCount, errorCount, errors }
}

export async function importEmployees(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await client.post("/employees/import", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { totalRows, createdCount, errorCount, created, errors }
}

// Triggers a browser download rather than returning JSON.
export async function exportEmployees() {
  const res = await client.get("/employees/export", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  const disposition = res.headers["content-disposition"] || "";
  const match = disposition.match(/filename=([^;]+)/);
  link.download = match ? match[1].trim() : "employees.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}