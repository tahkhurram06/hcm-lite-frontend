import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as dashboardApi from "../../api/dashboard";
import * as attendanceApi from "../../api/attendance";
import PageState from "../../components/PageState";

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function EmployeeDashboard() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["employee-dashboard"],
    queryFn: dashboardApi.getEmployeeDashboard,
  });

  const checkInMutation = useMutation({
    mutationFn: () => attendanceApi.checkIn({ source: "web" }),
    onSuccess: () => {
      setActionError("");
      queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] });
    },
    onError: (err) => setActionError(err.response?.data?.message || "Could not check in"),
  });

  const checkOutMutation = useMutation({
    mutationFn: () => attendanceApi.checkOut({ source: "web" }),
    onSuccess: () => {
      setActionError("");
      queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] });
    },
    onError: (err) => setActionError(err.response?.data?.message || "Could not check out"),
  });

  if (isLoading) return <PageState text="Loading your dashboard..." />;
  if (isError) return <PageState text="Could not load your dashboard." error />;

  const { checkInToday, hoursThisWeek, weeklyTarget, lateCountThisMonth, leaveBalance, lastPayslip } = data;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">My Dashboard</h1>

      {/* Check-in widget */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm text-gray-500">Today</div>
            <div className="text-lg font-semibold text-gray-800 mt-1">
              {!checkInToday.checkedIn && "Not checked in yet"}
              {checkInToday.checkedIn && !checkInToday.checkedOut && (
                <>
                  Checked in at {new Date(checkInToday.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {checkInToday.status === "late" && (
                    <span className="ml-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Late
                    </span>
                  )}
                </>
              )}
              {checkInToday.checkedOut && "Checked out — day complete"}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => checkInMutation.mutate()}
              disabled={checkInToday.checkedIn || checkInMutation.isPending}
              className="btn-primary"
            >
              {checkInMutation.isPending ? "Checking in..." : `Check in (${nowTime()})`}
            </button>
            <button
              onClick={() => checkOutMutation.mutate()}
              disabled={!checkInToday.checkedIn || checkInToday.checkedOut || checkOutMutation.isPending}
              className="btn-secondary"
            >
              {checkOutMutation.isPending ? "Checking out..." : "Check out"}
            </button>
          </div>
        </div>
        {actionError && <div className="mt-3 text-sm text-red-600 bg-red-50 rounded px-3 py-2">{actionError}</div>}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500">Hours this week</div>
          <div className="text-2xl font-semibold text-gray-800 mt-1">
            {hoursThisWeek} <span className="text-sm text-gray-400">/ {weeklyTarget}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500">Late this month</div>
          <div className="text-2xl font-semibold text-gray-800 mt-1">{lateCountThisMonth}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500">Last payslip</div>
          <div className="text-2xl font-semibold text-gray-800 mt-1">
            {lastPayslip ? lastPayslip.netPay.toLocaleString() : "—"}
          </div>
          {lastPayslip && (
            <div className="text-xs text-gray-400 mt-1">
              {lastPayslip.month}/{lastPayslip.year}
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500">Leave types</div>
          <div className="text-2xl font-semibold text-gray-800 mt-1">{leaveBalance.length}</div>
        </div>
      </div>

      {/* Leave balance */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="text-sm font-semibold text-gray-700 mb-4">Leave balance</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {leaveBalance.map((lb) => (
            <div key={lb.leaveType} className="border rounded-md p-3">
              <div className="text-xs text-gray-500 capitalize">{lb.leaveType}</div>
              <div className="text-lg font-semibold text-gray-800">
                {lb.remaining === null ? "Unlimited" : lb.remaining}
              </div>
              {lb.remaining !== null && (
                <div className="text-xs text-gray-400">of {lb.quota} days</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}