import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// roles: array of allowed roles, e.g. ["admin"], ["admin", "hr"]. Omit for "any logged-in user".
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  // Force password change before anything else, unless we're already there.
  if (user.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Outlet />;
}