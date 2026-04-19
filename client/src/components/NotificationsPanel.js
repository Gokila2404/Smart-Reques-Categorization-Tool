import { useCallback, useEffect, useMemo, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROUTES } from "../constants/paths";
import { getAdminComplaints, getUserComplaints } from "../services/api";

export default function NotificationsPanel({ role, variant = "page", onClose }) {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [dismissed, setDismissed] = useState(new Set());
  const [readSet, setReadSet] = useState(new Set());
  const [statusMap, setStatusMap] = useState({});
  const dismissedRef = useRef(new Set());
  const readSetRef = useRef(new Set());
  const statusMapRef = useRef({});

  const keyPrefix = role === "admin" ? "srct_admin_notifications" : "srct_user_notifications";
  const dismissedKey = `${keyPrefix}_dismissed_${auth?.user?.id || auth?.user?.email || "default"}`;
  const readKey = `${keyPrefix}_read_${auth?.user?.id || auth?.user?.email || "default"}`;
  const statusKey = `${keyPrefix}_status_${auth?.user?.id || auth?.user?.email || "default"}`;

  useEffect(() => {
    const raw = localStorage.getItem(dismissedKey);
    if (raw) {
      try {
        setDismissed(new Set(JSON.parse(raw)));
      } catch {
        setDismissed(new Set());
      }
    }
  }, [dismissedKey]);

  useEffect(() => {
    dismissedRef.current = dismissed;
  }, [dismissed]);

  useEffect(() => {
    const raw = localStorage.getItem(readKey);
    if (raw) {
      try {
        setReadSet(new Set(JSON.parse(raw)));
      } catch {
        setReadSet(new Set());
      }
    }
  }, [readKey]);

  useEffect(() => {
    readSetRef.current = readSet;
  }, [readSet]);

  useEffect(() => {
    const raw = localStorage.getItem(statusKey);
    if (raw) {
      try {
        setStatusMap(JSON.parse(raw));
      } catch {
        setStatusMap({});
      }
    }
  }, [statusKey]);

  useEffect(() => {
    statusMapRef.current = statusMap;
  }, [statusMap]);

  const persistDismissed = useCallback((nextSet) => {
    localStorage.setItem(dismissedKey, JSON.stringify([...nextSet]));
  }, [dismissedKey]);

  const persistRead = useCallback((nextSet) => {
    localStorage.setItem(readKey, JSON.stringify([...nextSet]));
  }, [readKey]);

  const persistStatus = useCallback((nextMap) => {
    localStorage.setItem(statusKey, JSON.stringify(nextMap));
  }, [statusKey]);

  const loadNotifications = useCallback(async () => {
    if (!auth?.token) {
      setItems([]);
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = role === "admin"
        ? await getAdminComplaints(auth.token)
        : await getUserComplaints(auth.token);

      const normalized = data.map((c) => ({
        id: c._id,
        requestId: c.requestId,
        title: role === "admin"
          ? (c.status === "New" ? `New complaint: ${c.requestId}` : `Request update: ${c.requestId}`)
          : `Status update for ${c.requestId}`,
        message: role === "admin"
          ? `${c.title} (${c.category})`
          : (c.adminRemarks || "No remarks yet. Your request is in queue."),
        status: c.status,
        time: c.updatedAt,
      }));

      const nextStatus = {};
      data.forEach((c) => {
        nextStatus[c._id] = c.status;
      });

      const changes = [];
      Object.entries(nextStatus).forEach(([id, status]) => {
        if (statusMapRef.current[id] && statusMapRef.current[id] !== status) {
          changes.push(id);
        }
      });

      if (changes.length > 0) {
        const nextDismissed = new Set(dismissedRef.current);
        const nextRead = new Set(readSetRef.current);
        changes.forEach((id) => nextDismissed.delete(id));
        changes.forEach((id) => nextRead.delete(id));
        setDismissed(nextDismissed);
        setReadSet(nextRead);
        persistDismissed(nextDismissed);
        persistRead(nextRead);
      }

      setStatusMap(nextStatus);
      persistStatus(nextStatus);

      setItems(normalized.sort((a, b) => new Date(b.time) - new Date(a.time)));
    } catch (err) {
      const fallback = role === "admin" ? "Unable to load admin alerts" : "Unable to load notifications";
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Session expired or unauthorized. Please log in again.");
      } else if (err.code === "ERR_NETWORK") {
        setError("Cannot reach the server. Please check that the backend is running.");
      } else {
        setError(err.response?.data?.message || fallback);
      }
    } finally {
      setLoading(false);
    }
  }, [auth?.token, persistDismissed, persistRead, persistStatus, role]);

  useEffect(() => {
    if (!auth?.token) return;
    loadNotifications();
  }, [auth?.token, loadNotifications]);

  useEffect(() => {
    if (!auth?.token) return;
    const interval = setInterval(() => {
      loadNotifications();
    }, 20000);
    return () => clearInterval(interval);
  }, [auth?.token, loadNotifications]);

  const filteredItems = useMemo(() => {
    const visible = items.filter((item) => !dismissed.has(item.id));
    return visible.filter((item) => (filter === "All" ? true : item.status === filter));
  }, [items, dismissed, filter]);

  const unreadCount = useMemo(
    () => filteredItems.filter((item) => !readSet.has(item.id)).length,
    [filteredItems, readSet]
  );

  const handleDismiss = (id) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    persistDismissed(next);
  };

  const handleMarkRead = (id) => {
    const next = new Set(readSet);
    next.add(id);
    setReadSet(next);
    persistRead(next);
  };

  const handleClearAll = () => {
    const next = new Set(items.map((i) => i.id));
    setDismissed(next);
    persistDismissed(next);
  };

  const handleMarkAllRead = () => {
    const next = new Set(items.map((i) => i.id));
    setReadSet(next);
    persistRead(next);
  };

  const statusClass = (status) => {
    if (status === "New") return "pill pill-new";
    if (status === "In Progress") return "pill pill-progress";
    return "pill pill-solved";
  };

  const detailsRoute = role === "admin" ? ROUTES.ADMIN_REQUEST_DETAILS : ROUTES.USER_REQUEST_DETAILS;
  const headerTitle = role === "admin" ? "Admin Alerts" : "Notifications";
  const emptyText = role === "admin" ? "No alert activity yet." : "No notification updates yet.";

  return (
    <div className={variant === "drawer" ? "notif-drawer-panel" : "notif-layout"}>
      <aside className="notif-panel">
        <div className="notif-header">
          <div>
            <h2>{headerTitle}</h2>
            <p className="notif-sub">Unread: {unreadCount} / Total: {filteredItems.length}</p>
          </div>
          <div className="notif-header-actions">
            <button className="btn btn-ghost" type="button" onClick={handleMarkAllRead}>Mark All Read</button>
            <button className="btn btn-muted" type="button" onClick={handleClearAll}>Clear All</button>
            {onClose && (
              <button className="btn btn-muted" type="button" onClick={onClose}>Close</button>
            )}
          </div>
        </div>
        <div className="notif-controls">
          <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>New</option>
            <option>In Progress</option>
            <option>Solved</option>
          </select>
        </div>
        {error && <div className="error-text">{error}</div>}
        {loading ? (
          <div className="empty" style={{ marginTop: 12 }}>Loading notifications...</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty" style={{ marginTop: 12 }}>{emptyText}</div>
        ) : (
          <div className="notif-list">
            {filteredItems.map((item) => (
              <article key={item.id} className={`notif-card ${readSet.has(item.id) ? "" : "unread"}`}>
                <div className={`notif-icon ${item.status === "Solved" ? "ok" : item.status === "In Progress" ? "warn" : "info"}`}>
                  {item.status === "Solved" ? "OK" : item.status === "In Progress" ? "!" : "i"}
                </div>
                <div className="notif-body">
                  <div className="notif-title-row">
                    <p className="notif-title">{item.title}</p>
                    {role === "admin"
                      ? <span className={statusClass(item.status)}>{item.status}</span>
                      : (!readSet.has(item.id) && <span className="notif-badge">New</span>)}
                  </div>
                  <p className="notif-text">{item.message}</p>
                  <div className="notif-meta">
                    {role === "admin" && <span>ID: {item.requestId}</span>}
                    <span>Updated: {new Date(item.time).toLocaleString()}</span>
                  </div>
                  <div className="notif-actions">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => {
                        handleMarkRead(item.id);
                        navigate(detailsRoute(item.id));
                        if (onClose) onClose();
                      }}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => handleMarkRead(item.id)}
                      disabled={readSet.has(item.id)}
                    >
                      {readSet.has(item.id) ? "Read" : "Mark as Read"}
                    </button>
                    <button className="btn btn-danger" type="button" onClick={() => handleDismiss(item.id)}>Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </aside>
      {variant === "page" && (
        <section className="notif-preview">
          <div className="notif-preview-card">
            <h3>{role === "admin" ? "Admin Activity" : "Updates Center"}</h3>
            <p className="subtext">
              {role === "admin"
                ? "Track updates and resolve requests quickly."
                : "Select a notification to view the complaint details."}
            </p>
            <div className="empty">No notification selected</div>
          </div>
        </section>
      )}
    </div>
  );
}
