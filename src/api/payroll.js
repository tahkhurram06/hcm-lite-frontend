import client from "./client";

export async function runPayroll({ month, year }) {
  const { data } = await client.post("/payroll/run", { month, year });
  return data; // { month, year, processed, results }
}

export async function listPayroll(params) {
  const { data } = await client.get("/payroll", { params }); // { month, year, department, status }
  return data; // { count, totals, payroll }
}

export async function finalizePayroll({ month, year }) {
  const { data } = await client.put("/payroll/finalize", { month, year });
  return data; // { message, count }
}

export async function getMyPayroll(params) {
  const { data } = await client.get("/payroll/me", { params }); // { year }
  return data; // { payroll }
}

export async function getPayrollById(id) {
  const { data } = await client.get(`/payroll/${id}`);
  return data; // { payroll }
}

// Triggers a browser download of the payslip PDF.
export async function downloadPayslip(id, filenameHint) {
  const res = await client.get(`/payroll/${id}/payslip`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  const disposition = res.headers["content-disposition"] || "";
  const match = disposition.match(/filename=([^;]+)/);
  link.download = match ? match[1].trim() : filenameHint || "payslip.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}