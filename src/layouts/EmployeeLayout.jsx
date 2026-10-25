import RoleLayout from "./RoleLayout";

const items = [
  { to: "/employee", label: "Dashboard" },
  { to: "/employee/attendance", label: "My Attendance" },
  { to: "/employee/leave", label: "My Leave" },
  { to: "/employee/payroll", label: "My Payslips" },
  { to: "/employee/profile", label: "My Profile" },
  { to: "/employee/announcements", label: "Announcements" },
];

export default function EmployeeLayout() {
  return <RoleLayout items={items} roleLabel="Employee" />;
}