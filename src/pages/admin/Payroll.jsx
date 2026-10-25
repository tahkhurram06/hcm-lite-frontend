import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as payrollApi from "../../api/payroll";
import * as orgApi from "../../api/org";
import PageState from "../../components/PageState";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function currentMonth() {
  return new Date().getMonth() + 1;
}
function currentYear() {
  return new Date().getFullYear();
}

const STATUS_STYLES = {
  draft: "bg-amber-100 text-amber-700",
  finalized: "bg-green-100 text-green-700",
};

export default function AdminPayroll() {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(currentMonth());
  const [year, setYear] = useState(currentYear());
  const [department, setDepartment] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [finalizeMessage, setFinalizeMessage] = useState("");
  const [finalizeError, setFinalizeError] = useState("");

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: orgApi.listDepartments,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["payroll", month, year, department],
    queryFn: () => payrollApi.listPayroll({ month, year, department: department || undefined }),
  });

  const finalizeMutation = useMutation({
    mutationFn: () => payrollApi.finalizePayroll({ month, year }),
    onSuccess: (res) => {
      setFinalizeMessage(res.message);
      setFinalizeError("");
      setConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ["payroll", month, year, department] });
    },
    onError: (err) => {
      setFinalizeError(err.response?.data?.message || "Could not finalize payroll");
      setConfirmOpen(false);
    },
  });

  async function handleDownload(record) {
    try {
      await payrollApi.downloadPayslip(record._id, `payslip-${record.employee?.code}-${month}-${year}.pdf`);
    } catch {
      alert("Could not download payslip.");
    }
  }

  const payroll = data?.payroll || [];
  const totals = data?.totals;
  const draftCount = payroll.filter((r) => r.status === "draft").length;
  const hasDrafts = draftCount > 0;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-gray-800">Payroll</h1>
        <div className="flex items-center gap-2">
          <select className="input w-auto" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
          <select className="input w-auto" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select className="input w-auto" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All departments</option>
            {(deptData?.departments || []).map((d) => (
              <option key={d._id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Finalize */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-700">
              Finalize {MONTH_NAMES[month - 1]} {year}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Locks every draft record for this period. Once finalized, a record can never be edited again —
              HR's draft is final.
            </p>
          </div>
          {!confirmOpen ? (
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!hasDrafts}
              className="btn-primary whitespace-nowrap disabled:opacity-50"
            >
              {hasDrafts ? `Finalize ${draftCount} draft(s)` : "No drafts to finalize"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Lock {draftCount} record(s) permanently?</span>
              <button onClick={() => finalizeMutation.mutate()} disabled={finalizeMutation.isPending} className="btn-danger">
                {finalizeMutation.isPending ? "Finalizing..." : "Yes, finalize"}
              </button>
              <button onClick={() => setConfirmOpen(false)} className="btn-secondary text-xs">
                Cancel
              </button>
            </div>
          )}
        </div>
        {finalizeMessage && <div className="mt-3 text-sm text-green-700 bg-green-50 rounded px-3 py-2">{finalizeMessage}</div>}
        {finalizeError && <div className="mt-3 text-sm text-red-600 bg-red-50 rounded px-3 py-2">{finalizeError}</div>}
      </div>

      {/* Totals */}
      {!isLoading && !isError && totals && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="text-sm text-gray-500">Records</div>
            <div className="text-2xl font-semibold text-gray-800 mt-1">{data.count}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="text-sm text-gray-500">Gross (monthly)</div>
            <div className="text-2xl font-semibold text-gray-800 mt-1">{totals.grossMonthly.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="text-sm text-gray-500">Net pay</div>
            <div className="text-2xl font-semibold text-gray-800 mt-1">{totals.netPay.toLocaleString()}</div>
          </div>
        </div>
      )}

      {isLoading && <PageState text="Loading payroll..." />}
      {isError && <PageState text="Could not load payroll records." error />}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Gross</th>
                <th className="px-4 py-3 font-medium">Net pay</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payroll.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No payroll records for this period yet.
                  </td>
                </tr>
              )}
              {payroll.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{r.employee?.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.employee?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.employee?.department}</td>
                  <td className="px-4 py-3 text-gray-600">{r.grossMonthly.toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.netPay.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDownload(r)} className="text-slate-700 hover:underline text-sm">
                      Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}