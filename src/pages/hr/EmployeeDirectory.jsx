import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as employeeApi from "../../api/employees";
import * as orgApi from "../../api/org";
import PageState from "../../components/PageState";

const LIMIT = 20;

export default function EmployeeDirectory() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: orgApi.listDepartments,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["employees", search, department, page],
    queryFn: () =>
      employeeApi.listEmployees({
        search: search || undefined,
        department: department || undefined,
        page,
        limit: LIMIT,
      }),
    keepPreviousData: true,
  });

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setPage(1);
  }
  function handleDeptChange(e) {
    setDepartment(e.target.value);
    setPage(1);
  }

  async function handleExport() {
    try {
      await employeeApi.exportEmployees();
    } catch {
      alert("Could not export employees.");
    }
  }

  const employees = data?.employees || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-gray-800">Employee Directory</h1>
        <div className="flex gap-2">
          <Link to="/hr/import" className="btn-secondary">
            CSV Import
          </Link>
          <button onClick={handleExport} className="btn-secondary">
            Export CSV
          </button>
          <Link to="/hr/employees/new" className="btn-primary">
            Register Employee
          </Link>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          className="input max-w-xs"
          placeholder="Search by name, code, or email..."
          value={search}
          onChange={handleSearchChange}
        />
        <select className="input w-auto" value={department} onChange={handleDeptChange}>
          <option value="">All departments</option>
          {(deptData?.departments || []).map((d) => (
            <option key={d._id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <PageState text="Loading employees..." />}
      {isError && <PageState text="Could not load employees." error />}

      {!isLoading && !isError && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Designation</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No employees found.
                    </td>
                  </tr>
                )}
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{emp.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{emp.name}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.designation}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          emp.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/hr/employees/${emp._id}`} className="text-slate-700 hover:underline text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>
                Page {page} of {totalPages} · {total} employee{total !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <button
                  className="btn-secondary text-xs disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <button
                  className="btn-secondary text-xs disabled:opacity-50"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}