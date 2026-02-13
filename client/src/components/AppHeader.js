import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { DEFAULT_ROUTE_BY_ROLE, ROUTES } from "../constants/paths";

export default function AppHeader() {
  const { auth, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!auth?.token) return null;

  const dashboardRoute = DEFAULT_ROUTE_BY_ROLE[auth.user.role] || ROUTES.LOGIN;

  const nav = auth.user.role === "admin"
    ? [
      { to: dashboardRoute, label: "Admin Dashboard" },
      { to: ROUTES.ADMIN_QUEUE, label: "Queue" },
      { to: ROUTES.ADMIN_ACTIVITY, label: "Activity" },
      { to: ROUTES.ADMIN_NOTIFICATIONS, label: "Admin Alerts" },
      { to: ROUTES.ADMIN_REPORTS, label: "Reports" },
    ]
    : [
      { to: dashboardRoute, label: "My Dashboard" },
      { to: ROUTES.USER_PROFILE, label: "Profile" },
      { to: ROUTES.USER_CATEGORIES, label: "Category Rules" },
      { to: ROUTES.USER_NOTIFICATIONS, label: "My Notifications" },
      { to: ROUTES.USER_REQUEST_GUIDE, label: "Request Guide" },
      { to: ROUTES.USER_HELP_CENTER, label: "Help Center" },
    ];

  const onLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
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
      <button className="btn btn-muted" onClick={onLogout} type="button">
        Logout
      </button>
    </header>
  );
}
