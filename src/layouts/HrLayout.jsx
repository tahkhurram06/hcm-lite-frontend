import RoleLayout from "./RoleLayout";

const items = [
  { to: "/hr", label: "Dashboard" },
  { to: "/hr/employees", label: "Employees" },
  { to: "/hr/employees/new", label: "Register Employee" },
  { to: "/hr/import", label: "CSV Import" },
  { to: "/hr/attendance", label: "Attendance Board" },
  { to: "/hr/leave", label: "Leave Inbox" },
  { to: "/hr/payroll", label: "Payroll" },
  { to: "/hr/announcements", label: "Announcements" },
  { to: "/hr/settings", label: "Company Settings" },
];

export default function HrLayout() {
  return <RoleLayout items={items} roleLabel="HR" />;
}