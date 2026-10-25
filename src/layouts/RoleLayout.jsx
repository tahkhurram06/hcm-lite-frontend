import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AiChatPanel from "../components/AiChatPanel";

const ROLE_ACCENTS = {
  Admin: "from-indigo-600 to-violet-600",
  HR: "from-teal-600 to-emerald-600",
  Employee: "from-amber-500 to-orange-500",
};

export default function RoleLayout({ items, roleLabel }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const accent = ROLE_ACCENTS[roleLabel] || ROLE_ACCENTS.Admin;

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
        <div className={`px-5 py-5 border-b border-slate-800 bg-gradient-to-br ${accent}`}>
          <div className="text-lg font-bold text-white tracking-tight">HCM Lite</div>
          <div className="text-xs font-medium text-white/80 mt-0.5">{roleLabel} workspace</div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`group relative block rounded-lg px-3 py-2.5 text-sm font-medium
                  transition-all duration-200 ease-out
                  ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5 hover:translate-x-1"
                  }`}
              >
                {isActive && (
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-to-b ${accent} animate-pop`}
                  />
                )}
                <span className="pl-2">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-2 px-2 mb-3">
            <div
              className={`h-8 w-8 rounded-full bg-gradient-to-br ${accent} flex items-center justify-center text-xs font-bold text-white shrink-0`}
            >
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-slate-100 truncate">{user?.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200
                       transition-all duration-200 hover:bg-slate-700 hover:-translate-y-0.5"
          >
            Log out
          </button>
        </div>
      </aside>

      <main key={location.pathname} className="flex-1 overflow-y-auto animate-fade-in">
        <Outlet />
      </main>

      <AiChatPanel />
    </div>
  );
}