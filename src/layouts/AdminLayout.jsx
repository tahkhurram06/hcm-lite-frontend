import RoleLayout from "./RoleLayout";

const items = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/settings", label: "Company Settings" },
  { to: "/admin/departments", label: "Departments" },
  { to: "/admin/designations", label: "Designations" },
  { to: "/admin/leave-types", label: "Leave Types" },
  { to: "/admin/holidays", label: "Holidays" },
  { to: "/admin/users", label: "HR & Employee Logins" },
  { to: "/admin/employees", label: "Employees" },
  { to: "/admin/leave", label: "Leave Records" },
  { to: "/admin/payroll", label: "Payroll" },
  { to: "/admin/audit", label: "Audit Log" },
  { to: "/admin/announcements", label: "Announcements" },
];

export default function AdminLayout() {
  return <RoleLayout items={items} roleLabel="Admin" />;
}