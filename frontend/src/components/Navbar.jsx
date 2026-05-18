import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/theme";

const NAV_LINKS = {
  STUDENT: [
    { label: "Browse", to: "/student/courses" },
    { label: "Wishlist", to: "/student/wishlist" },
    { label: "My Learning", to: "/student/dashboard" },
    { label: "Profile", to: "/profile" },
  ],
  INSTRUCTOR: [
    { label: "My Courses", to: "/instructor/dashboard" },
    { label: "Create Course", to: "/instructor/courses/new" },
    { label: "Profile", to: "/profile" },
  ],
  ADMIN: [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Users", to: "/admin/users" },
    { label: "Courses", to: "/admin/courses" },
    { label: "Profile", to: "/profile" },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const links = user ? NAV_LINKS[user.role] ?? [] : [];
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.role?.toLowerCase();

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 12L6 4L10 9L12 6L14 12H2Z" fill="#ffffff" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-950">LearnHub</span>
        </Link>

        {user && (
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 14.2A7.5 7.5 0 0 1 9.8 4a8 8 0 1 0 10.2 10.2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          {user ? (
            <>
              <span className="hidden text-sm font-semibold capitalize text-slate-700 sm:block">
                {displayName}
              </span>
              <button type="button" onClick={logout} className="app-button-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="app-button-secondary">
                Login
              </Link>
              <Link to="/register" className="app-button-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
