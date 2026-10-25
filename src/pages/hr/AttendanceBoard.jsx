import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as attendanceApi from "../../api/attendance";
import * as orgApi from "../../api/org";
import PageState from "../../components/PageState";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_STYLES = {
  present: "bg-green-100 text-green-700",
  late: "bg-amber-100 text-amber-700",
  half_day: "bg-orange-100 text-orange-700",
  checked_in: "bg-blue-100 text-blue-700",
  on_leave: "bg-purple-100 text-purple-700",
  absent: "bg-red-100 text-red-700",
  day_off: "bg-gray-100 text-gray-500",
  missing_checkout: "bg-rose-100 text-rose-700",
};

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AttendanceBoard() {
  const [date, setDate] = useState(todayISO());
  const [department, setDepartment] = useState("");

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: orgApi.listDepartments,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["attendance-board", date, department],
    queryFn: () => attendanceApi.getBoard({ date, department: department || undefined }),
  });

  const board = data?.board || [];
  const counts = board.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-gray-800">Attendance Board</h1>
        <div className="flex items-center gap-2">
          <input type="date" className="input w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
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

      {!isLoading && !isError && (
        <div className="flex gap-3 mb-4 flex-wrap text-xs">
          {Object.entries(counts).map(([status, count]) => (
            <span key={status} className={`px-3 py-1 rounded-full font-medium ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
              {status.replace("_", " ")}: {count}
            </span>
          ))}
        </div>
      )}

      {isLoading && <PageState text="Loading board..." />}
      {isError && <PageState text="Could not load the attendance board." error />}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 font-medium">Check-out</th>
                <th className="px-4 py-3 font-medium">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {board.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No active employees found.
                  </td>
                </tr>
              )}
              {board.map((row) => (
                <tr key={row.employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{row.employee.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{row.employee.name}</td>
                  <td className="px-4 py-3 text-gray-600">{row.employee.department}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[row.status] || "bg-gray-100 text-gray-600"}`}>
                      {row.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{fmtTime(row.checkIn)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmtTime(row.checkOut)}</td>
                  <td className="px-4 py-3 text-gray-600">{row.workedHours ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}