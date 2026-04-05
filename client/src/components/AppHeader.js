import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { DEFAULT_ROUTE_BY_ROLE, ROUTES } from "../constants/paths";
import NotificationsPanel from "./NotificationsPanel";

export default function AppHeader() {
  const { auth, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [showDrawer, setShowDrawer] = useState(false);

  if (!auth?.token) return null;

  const dashboardRoute = DEFAULT_ROUTE_BY_ROLE[auth.user.role] || ROUTES.LOGIN;

  const nav = auth.user.role === "admin"
    ? [
      { to: dashboardRoute, label: "Admin Dashboard" },
    ]
    : [
      { to: dashboardRoute, label: "My Dashboard" },
    ];

  const onLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header-left">
          <p className="app-brand">SRCT</p>
          <span className="role-badge">{auth.user.role.toUpperCase()}</span>
        </div>
        <nav className="app-nav">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`app-nav-link ${location.pathname === item.to ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="app-header-actions">
          <button className="icon-btn" type="button" aria-label="Notifications" onClick={() => setShowDrawer(true)}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="currentColor" d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z"/>
            </svg>
          </button>
          <button className="btn btn-muted" onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </header>
      {showDrawer && (
        <div className="notif-drawer">
          <div className="notif-drawer-backdrop" onClick={() => setShowDrawer(false)} />
          <NotificationsPanel
            role={auth.user.role}
            variant="drawer"
            onClose={() => setShowDrawer(false)}
          />
        </div>
      )}
    </>
  );
}
