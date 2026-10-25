import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import * as authApi from "./api/auth";
import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Placeholder from "./components/Placeholder";

import Setup from "./pages/auth/Setup";
import Login from "./pages/auth/Login";
import ChangePassword from "./pages/auth/ChangePassword";

import AdminLayout from "./layouts/AdminLayout";
import HrLayout from "./layouts/HrLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminSettings from "./pages/admin/Settings";
import AdminDepartments from "./pages/admin/Departments";
import AdminLeaveTypes from "./pages/admin/LeaveTypes";
import AdminHolidays from "./pages/admin/Holidays";
import AdminPayroll from "./pages/admin/Payroll";
import AdminUsers from "./pages/admin/Users";

import EmployeeDirectory from "./pages/hr/EmployeeDirectory";
import RegisterEmployee from "./pages/hr/RegisterEmployee";
import AttendanceBoard from "./pages/hr/AttendanceBoard";
import LeaveInbox from "./pages/hr/LeaveInbox";
import HrPayroll from "./pages/hr/Payroll";
import CsvImport from "./pages/hr/CsvImport";

import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeLeave from "./pages/employee/Leave";
import EmployeePayroll from "./pages/employee/Payroll";

// Checks setup-status once and decides whether /login or /setup is the
// right landing page. A fresh install has no admin yet, so we route
// straight to Setup instead of showing a login form that can't work.
function useSetupStatus() {
  const [status, setStatus] = useState({ loading: true, setupComplete: null });
  useEffect(() => {
    authApi
      .getSetupStatus()
      .then(({ setupComplete }) => setStatus({ loading: false, setupComplete }))
      .catch(() => setStatus({ loading: false, setupComplete: true })); // fail safe: assume complete
  }, []);
  return status;
}

function RootRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { loading: setupLoading, setupComplete } = useSetupStatus();

  if (authLoading || setupLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!setupComplete) return <Navigate to="/setup" replace />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

function SetupRoute() {
  const { loading, setupComplete } = useSetupStatus();
  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (setupComplete) return <Navigate to="/login" replace />;
  return <Setup />;
}

function LoginRoute() {
  const { loading, setupComplete } = useSetupStatus();
  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!setupComplete) return <Navigate to="/setup" replace />;
  return <Login />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/setup" element={<SetupRoute />} />
      <Route path="/login" element={<LoginRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/departments" element={<AdminDepartments />} />
          <Route path="/admin/designations" element={<Placeholder title="Designations" />} />
          <Route path="/admin/leave-types" element={<AdminLeaveTypes />} />
          <Route path="/admin/holidays" element={<AdminHolidays />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/employees" element={<Placeholder title="Employees" />} />
          <Route path="/admin/employees/:id" element={<Placeholder title="Employee Detail" />} />
          <Route path="/admin/leave" element={<Placeholder title="Leave Records" />} />
          <Route path="/admin/payroll" element={<AdminPayroll />} />
          <Route path="/admin/audit" element={<Placeholder title="Audit Log" />} />
          <Route path="/admin/announcements" element={<Placeholder title="Announcements" />} />
        </Route>
      </Route>

      {/* HR */}
      <Route element={<ProtectedRoute roles={["hr"]} />}>
        <Route element={<HrLayout />}>
          <Route path="/hr" element={<Placeholder title="HR Dashboard" />} />
          <Route path="/hr/employees" element={<EmployeeDirectory />} />
          <Route path="/hr/employees/new" element={<RegisterEmployee />} />
          <Route path="/hr/employees/:id" element={<Placeholder title="Employee Detail" />} />
          <Route path="/hr/import" element={<CsvImport />} />
          <Route path="/hr/attendance" element={<AttendanceBoard />} />
          <Route path="/hr/leave" element={<LeaveInbox />} />
          <Route path="/hr/payroll" element={<HrPayroll />} />
          <Route path="/hr/announcements" element={<Placeholder title="Announcements" />} />
          <Route path="/hr/settings" element={<Placeholder title="Company Settings (view)" />} />
        </Route>
      </Route>

      {/* Employee */}
      <Route element={<ProtectedRoute roles={["employee"]} />}>
        <Route element={<EmployeeLayout />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/attendance" element={<Placeholder title="My Attendance" />} />
          <Route path="/employee/leave" element={<EmployeeLeave />} />
          <Route path="/employee/payroll" element={<EmployeePayroll />} />
          <Route path="/employee/profile" element={<Placeholder title="My Profile" />} />
          <Route path="/employee/announcements" element={<Placeholder title="Announcements" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}