import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as payrollApi from "../../api/payroll";
import PageState from "../../components/PageState";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function EmployeePayroll() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-payroll", year],
    queryFn: () => payrollApi.getMyPayroll({ year }),
  });

  async function handleDownload(record) {
    try {
      await payrollApi.downloadPayslip(record._id, `payslip-${record.month}-${record.year}.pdf`);
    } catch {
      alert("Could not download payslip.");
    }
  }

  const payroll = data?.payroll || [];

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-gray-800">My Payslips</h1>
        <select className="input w-auto" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <PageState text="Loading payslips..." />}
      {isError && <PageState text="Could not load your payslips." error />}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg shadow divide-y">
          {payroll.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              No finalized payslips for {year} yet. They'll appear here once payroll is finalized.
            </div>
          )}
          {payroll.map((p) => (
            <div key={p._id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">
                  {MONTH_NAMES[p.month - 1]} {p.year}
                </div>
                <div className="text-sm text-gray-500">Net pay: {p.netPay.toLocaleString()}</div>
              </div>
              <button onClick={() => handleDownload(p)} className="btn-secondary text-sm">
                Download PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}