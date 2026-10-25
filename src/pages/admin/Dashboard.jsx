import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as dashboardApi from "../../api/dashboard";
import * as orgApi from "../../api/org";
import * as aiApi from "../../api/ai";
import PageState from "../../components/PageState";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function monthStartISO() {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1)).toISOString().slice(0, 10);
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-gray-800 mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function BarList({ title, data, formatValue = (v) => v }) {
  const entries = Object.entries(data || {});
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="text-sm font-semibold text-gray-700 mb-4">{title}</div>
      {entries.length === 0 && <div className="text-sm text-gray-400">No data yet.</div>}
      <div className="space-y-3">
        {entries.map(([dept, value]) => (
          <div key={dept}>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{dept}</span>
              <span>{formatValue(value)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded">
              <div
                className="h-2 bg-slate-700 rounded"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [from, setFrom] = useState(monthStartISO());
  const [to, setTo] = useState(todayISO());
  const [department, setDepartment] = useState("");
  const [summary, setSummary] = useState("");

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: orgApi.listDepartments,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard", from, to, department],
    queryFn: () => dashboardApi.getAdminDashboard({ from, to, department: department || undefined }),
  });

  const summarizeMutation = useMutation({
    mutationFn: () => aiApi.summarize(data.kpis),
    onSuccess: (res) => setSummary(res.summary),
    onError: () => setSummary("Couldn't generate a summary right now — please try again."),
  });

  if (isLoading) return <PageState text="Loading dashboard..." />;
  if (isError) return <PageState text="Could not load the dashboard." error />;

  const kpis = data.kpis;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-gray-800">Company Dashboard</h1>
        <div className="flex items-center gap-2">
          <input type="date" className="input w-auto" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" className="input w-auto" value={to} onChange={(e) => setTo(e.target.value)} />
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

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard label="Headcount" value={kpis.headcount} />
        <KpiCard label="Exits in period" value={kpis.exitsInPeriod} />
        <KpiCard label="Attrition (YTD)" value={`${kpis.attritionRateYTD}%`} />
        <KpiCard label="Payroll cost" value={kpis.payrollCost.toLocaleString()} sub="Finalized runs in range" />
        <KpiCard label="Avg salary" value={kpis.avgSalary.toLocaleString()} sub="Gross, active employees" />
      </div>

      {/* AI Summary */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">AI Insights</div>
          <button
            onClick={() => summarizeMutation.mutate()}
            disabled={summarizeMutation.isPending}
            className="btn-secondary text-xs"
          >
            {summarizeMutation.isPending ? "Summarizing..." : "Summarize"}
          </button>
        </div>
        {summary && (
          <div className="mt-3 text-sm text-gray-700 whitespace-pre-line bg-slate-50 rounded-md p-3">
            {summary}
            <div className="text-xs text-gray-400 mt-2">AI-generated</div>
          </div>
        )}
        {!summary && (
          <div className="mt-3 text-sm text-gray-400">
            Click Summarize to get 3-5 insight bullets from the current KPIs.
          </div>
        )}
      </div>

      {/* Breakdown charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BarList title="Headcount by department" data={data.headcountByDepartment} />
        <BarList
          title="Payroll cost by department"
          data={data.payrollCostByDepartment ? mapNet(data.payrollCostByDepartment) : {}}
          formatValue={(v) => v.toLocaleString()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BarList
          title="Avg salary by department"
          data={data.avgSalaryByDepartment}
          formatValue={(v) => v.toLocaleString()}
        />
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm font-semibold text-gray-700 mb-2">Average tenure</div>
          <div className="text-2xl font-semibold text-gray-800">{data.avgTenureYears} yrs</div>
          <div className="text-xs text-gray-400 mt-1">Across active employees</div>
        </div>
      </div>

      {/* Audit feed */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="text-sm font-semibold text-gray-700 mb-4">Recent activity</div>
        {(!data.auditFeed || data.auditFeed.length === 0) && (
          <div className="text-sm text-gray-400">No activity yet.</div>
        )}
        <div className="divide-y">
          {(data.auditFeed || []).map((entry) => (
            <div key={entry._id} className="py-2 flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-gray-700">{entry.actorName}</span>{" "}
                <span className="text-gray-500">
                  {entry.action} {entry.entity}
                </span>
              </div>
              <div className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// payrollCostByDepartment values are { grossMonthly, netPay } objects — flatten to netPay for the bar list.
function mapNet(byDept) {
  return Object.fromEntries(Object.entries(byDept).map(([k, v]) => [k, v.netPay]));
}