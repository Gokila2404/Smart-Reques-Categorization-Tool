import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROUTES } from "../constants/paths";
import { API_BASE_URL } from "../constants/apiPaths";
import { addAdminRemarks, getAdminAnalytics, getAdminComplaints, updateComplaintStatus } from "../services/api";
import NotificationsPanel from "../components/NotificationsPanel";

const priorityBadgeClass = (priority) => {
  if (priority === "High") return "priority-pill priority-high";
  if (priority === "Low") return "priority-pill priority-low";
  return "priority-pill priority-medium";
};

const renderStars = (count) => "★".repeat(count);
const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const AdminDashboard = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [showNotif, setShowNotif] = useState(false);
  const [manageTarget, setManageTarget] = useState(null);
  const [manageStatus, setManageStatus] = useState("New");
  const [manageRemarks, setManageRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState("complaints");
  const [analytics, setAnalytics] = useState({
    totalCount: 0,
    todayCount: 0,
    status: { new: 0, inProgress: 0, solved: 0, pending: 0 },
    categories: { Networking: 0, Fees: 0, Discipline: 0, General: 0 },
    solvedRate: 0,
  });

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminComplaints(auth.token);
      setComplaints(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load admin complaints");
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await getAdminAnalytics(auth.token);
      setAnalytics(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load analytics");
    }
  }, [auth.token]);

  useEffect(() => {
    if (!auth?.token || auth?.user?.role !== "admin") {
      navigate(ROUTES.LOGIN);
      return;
    }
    fetchComplaints();
    fetchAnalytics();
  }, [auth?.token, auth?.user?.role, fetchComplaints, fetchAnalytics, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchComplaints();
      fetchAnalytics();
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchComplaints, fetchAnalytics]);

  const statusClass = (status) => {
    if (status === "New") return "pill pill-new";
    if (status === "In Progress") return "pill pill-progress";
    return "pill pill-solved";
  };

  const filteredComplaints = complaints.filter((c) => (filter === "All" ? true : c.status === filter));
  const summary = {
    total: complaints.length,
    new: complaints.filter((c) => c.status === "New").length,
    progress: complaints.filter((c) => c.status === "In Progress").length,
    solved: complaints.filter((c) => c.status === "Solved").length,
  };

  const openManage = (c) => {
    setManageTarget(c);
    setManageStatus(c.status);
    setManageRemarks(c.adminRemarks || "");
  };

  const saveManage = async () => {
    if (!manageTarget) return;
    try {
      setSaving(true);
      if (manageStatus !== manageTarget.status) {
        await updateComplaintStatus(manageTarget._id, manageStatus, auth.token);
      }
      if (manageRemarks !== (manageTarget.adminRemarks || "")) {
        await addAdminRemarks(manageTarget._id, manageRemarks, auth.token);
      }
      setManageTarget(null);
      await fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update complaint");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const resolveAttachmentUrl = (attachmentUrl) => {
    if (!attachmentUrl) return "";
    if (attachmentUrl.startsWith("http")) return attachmentUrl;
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${baseUrl}${attachmentUrl}`;
  };

  const latestAction = (complaint) => {
    if (!complaint?.statusHistory?.length) return "No actions yet";
    const last = complaint.statusHistory[complaint.statusHistory.length - 1];
    return `${last.action || "Update"} · ${formatDateTime(last.at)}`;
  };

  return (
    <div className="user-shell">
      <header className="user-topbar">
        <div className="brand">
          <div className="brand-logo">S</div>
          <div>
            <div className="brand-title">SRCT</div>
            <div className="brand-sub">Smart Request Categorization Tool</div>
          </div>
        </div>
        <div className="top-actions">
          <button
            className="icon-btn"
            type="button"
            aria-label="Notifications"
            onClick={() => setShowNotif(true)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="currentColor" d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z" />
            </svg>
          </button>
          <div className="user-chip">
            <div className="user-avatar">{auth?.user?.name?.[0] || "A"}</div>
            <div>
              <div className="user-name">{auth?.user?.name || "Admin"}</div>
              <div className="user-role">Admin</div>
            </div>
          </div>
          <button className="icon-btn" type="button" aria-label="Logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="currentColor" d="M14 7V5H5v14h9v-2H7V7h7Zm3.59 5-2.3 2.29 1.41 1.42L21.41 12l-4.71-3.71-1.41 1.42 2.3 2.29H10v2h7.59Z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="user-hero">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Logged in as {auth?.user?.name} - {auth?.user?.adminDomain || "General"} Admin</p>
          </div>
        </section>

        <nav className="dashboard-tabs">
          <button
            className={`tab-btn ${activePanel === "complaints" ? "active" : ""}`}
            type="button"
            onClick={() => setActivePanel("complaints")}
          >
            Complaint Management
          </button>
          <button
            className={`tab-btn ${activePanel === "analytics" ? "active" : ""}`}
            type="button"
            onClick={() => setActivePanel("analytics")}
          >
            Smart Analysis Dashboard
          </button>
        </nav>

        <div className="dashboard-grid dashboard-grid-single">

          {activePanel === "analytics" ? (
            <section className="card">
              <div className="card-header">
                <div>
                  <h3>Smart Dashboard</h3>
                  <p>Live insights from complaint activity</p>
                </div>
              </div>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="analytics-label">Total Complaints</div>
                  <div className="analytics-value">{analytics.totalCount}</div>
                  <div className="analytics-sub">Today: {analytics.todayCount}</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-label">Solved Rate</div>
                  <div className="analytics-value">{analytics.solvedRate.toFixed(0)}%</div>
                  <div className="analytics-sub">
                    Solved {analytics.status.solved} / Pending {analytics.status.pending}
                  </div>
                  <div className="analytics-bar">
                    <span style={{ width: `${Math.min(100, analytics.solvedRate)}%` }} />
                  </div>
                </div>
              </div>
              <div className="analytics-split">
                <div className="analytics-panel">
                  <h4>Category Breakdown</h4>
                  <div className="analytics-row">
                    <span>Networking</span>
                    <strong>{analytics.categories.Networking}</strong>
                  </div>
                  <div className="analytics-row">
                    <span>Fees</span>
                    <strong>{analytics.categories.Fees}</strong>
                  </div>
                  <div className="analytics-row">
                    <span>Discipline</span>
                    <strong>{analytics.categories.Discipline}</strong>
                  </div>
                  <div className="analytics-row">
                    <span>General</span>
                    <strong>{analytics.categories.General}</strong>
                  </div>
                </div>
                <div className="analytics-panel">
                  <h4>Status Snapshot</h4>
                  <div className="analytics-row">
                    <span>New</span>
                    <strong>{analytics.status.new}</strong>
                  </div>
                  <div className="analytics-row">
                    <span>In Progress</span>
                    <strong>{analytics.status.inProgress}</strong>
                  </div>
                  <div className="analytics-row">
                    <span>Solved</span>
                    <strong>{analytics.status.solved}</strong>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="card">
              <div className="card-header">
                <div>
                  <h3>All Complaints</h3>
                  <p>{filteredComplaints.length} complaints shown</p>
                </div>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="select filter-select">
                  <option>All</option>
                  <option>New</option>
                  <option>In Progress</option>
                  <option>Solved</option>
                </select>
              </div>
              {error && <div className="error-text">{error}</div>}
              {loading && <div className="empty">Loading complaints...</div>}
              {!loading && filteredComplaints.length === 0 && (
                <div className="empty">No complaints assigned currently.</div>
              )}
              {!loading && filteredComplaints.length > 0 && (
                <>
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Attachment</th>
                          <th>Feedback</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredComplaints.map((c) => (
                          <tr key={c._id}>
                            <td>{c.requestId}</td>
                            <td>{c.userId?.name || "-"}</td>
                            <td>{c.title}</td>
                            <td><span className="tag">{c.category}</span></td>
                            <td><span className={priorityBadgeClass(c.priority)}>{c.priority || "Medium"}</span></td>
                            <td><span className={statusClass(c.status)}>{c.status}</span></td>
                            <td>{c.date || new Date(c.createdAt).toLocaleDateString()}</td>
                            <td>
                              {c.attachment?.url ? (
                                <a
                                  href={resolveAttachmentUrl(c.attachment.url)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  View
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td>
                              {c.feedback?.rating ? (
                                <div className="feedback-cell">
                                  <span className="feedback-stars">{renderStars(c.feedback.rating)}</span>
                                  <span className="feedback-text">{c.feedback.comment || "No comment"}</span>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td>
                              <button className="btn btn-muted" type="button" onClick={() => openManage(c)}>
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="complaint-cards">
                    {filteredComplaints.map((c) => (
                      <div className="complaint-card" key={c._id}>
                        <div className="complaint-card-head">
                          <div>
                            <div className="complaint-title">{c.title}</div>
                            <div className="complaint-id">{c.requestId}</div>
                            <div className="complaint-user">User: {c.userId?.name || "-"}</div>
                          </div>
                          <div className="complaint-badges">
                            <span className={priorityBadgeClass(c.priority)}>{c.priority || "Medium"}</span>
                            <span className={statusClass(c.status)}>{c.status}</span>
                          </div>
                        </div>
                        <div className="complaint-meta">
                          <span className="tag">{c.category}</span>
                          <span className="meta-text">Created: {formatDateTime(c.createdAt)}</span>
                        </div>
                        <div className="complaint-log">
                          <div><strong>Updated:</strong> {formatDateTime(c.updatedAt)}</div>
                          <div><strong>Latest:</strong> {latestAction(c)}</div>
                        </div>
                        <div className="complaint-actions">
                          {c.attachment?.url ? (
                            <a
                              className="btn btn-muted btn-sm"
                              href={resolveAttachmentUrl(c.attachment.url)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View Attachment
                            </a>
                          ) : (
                            <span className="muted-row">No attachment</span>
                          )}
                          {c.feedback?.rating ? (
                            <div className="feedback-cell">
                              <span className="feedback-stars">{renderStars(c.feedback.rating)}</span>
                              <span className="feedback-text">{c.feedback.comment || "No comment"}</span>
                            </div>
                          ) : (
                            <span className="muted-row">No feedback yet</span>
                          )}
                          <button className="btn btn-ghost btn-sm" type="button" onClick={() => openManage(c)}>
                            Manage
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </main>

      {showNotif && (
        <div className="notif-drawer">
          <div className="notif-drawer-backdrop" onClick={() => setShowNotif(false)} />
          <NotificationsPanel role="admin" variant="drawer" onClose={() => setShowNotif(false)} />
        </div>
      )}

      {manageTarget && (
        <div className="modal-backdrop" onClick={() => setManageTarget(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Manage Complaint</h3>
                <p>{manageTarget.requestId} - {manageTarget.title}</p>
              </div>
              <button className="icon-btn" type="button" onClick={() => setManageTarget(null)}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4Z" />
                </svg>
              </button>
            </div>
            <label className="field-label">Status</label>
            <select className="select" value={manageStatus} onChange={(e) => setManageStatus(e.target.value)}>
              <option>New</option>
              <option>In Progress</option>
              <option>Solved</option>
            </select>
            <label className="field-label" style={{ marginTop: 10 }}>Remarks</label>
            <textarea className="textarea" value={manageRemarks} onChange={(e) => setManageRemarks(e.target.value)} />
            <button className="btn btn-primary" onClick={saveManage} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
