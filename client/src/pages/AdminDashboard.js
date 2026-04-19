import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROUTES } from "../constants/paths";
import { API_BASE_URL } from "../constants/apiPaths";
import {
  createAdminComplaint,
  deleteAdminComplaint,
  getAdminComplaints,
  getUsers,
  addAdminRemarks,
  updateComplaintStatus,
} from "../services/api";
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
  const [showForm, setShowForm] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [studentUsers, setStudentUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("New");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [success, setSuccess] = useState("");
  const [activePanel, setActivePanel] = useState("complaints");

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

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsers(auth.token);
      setStudentUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load users");
    }
  }, [auth.token]);

  useEffect(() => {
    if (!auth?.token || auth?.user?.role !== "admin") {
      navigate(ROUTES.LOGIN);
      return;
    }
    fetchComplaints();
    fetchUsers();
  }, [auth?.token, auth?.user?.role, fetchComplaints, fetchUsers, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchComplaints();
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchComplaints]);

  const statusClass = (status) => {
    if (status === "New") return "pill pill-new";
    if (status === "In Progress") return "pill pill-progress";
    return "pill pill-solved";
  };

  const filteredComplaints = complaints.filter((c) => (filter === "All" ? true : c.status === filter));

  const analyticsView = useMemo(() => {
    const total = complaints.length;
    const now = new Date();
    const today = complaints.filter((c) => new Date(c.createdAt).toDateString() === now.toDateString()).length;
    const newCount = complaints.filter((c) => c.status === "New").length;
    const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
    const solvedCount = complaints.filter((c) => c.status === "Solved").length;
    const highPriorityCount = complaints.filter((c) => c.priority === "High").length;
    const pendingCount = newCount + inProgressCount;
    const solvedRate = total ? (solvedCount / total) * 100 : 0;

    const categoryMap = complaints.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const statusChart = [
      { label: "New", value: newCount, tone: "new" },
      { label: "In Progress", value: inProgressCount, tone: "progress" },
      { label: "Solved", value: solvedCount, tone: "solved" },
    ].map((item) => ({
      ...item,
      width: total ? Math.max((item.value / total) * 100, item.value ? 8 : 0) : 0,
    }));

    const categoryChart = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({
        label,
        value,
        width: total ? Math.max((value / total) * 100, value ? 8 : 0) : 0,
      }));

    const recentActivity = [...complaints]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);

    return {
      total,
      today,
      pendingCount,
      highPriorityCount,
      solvedCount,
      solvedRate,
      statusChart,
      categoryChart,
      recentActivity,
    };
  }, [complaints]);

  const resetComplaintForm = useCallback(() => {
    setSelectedUserId("");
    setTitle("");
    setPlace("");
    setDate("");
    setTime("");
    setDescription("");
    setPriority("Medium");
    setStatus("New");
    setRemarks("");
    setEditingComplaint(null);
  }, []);

  const openCreateForm = () => {
    setError("");
    setSuccess("");
    resetComplaintForm();
    setShowForm(true);
  };

  const openEditForm = (complaint) => {
    setError("");
    setSuccess("");
    setEditingComplaint(complaint);
    setTitle(complaint.title || "");
    setPlace(complaint.place || "");
    setDate(complaint.date || "");
    setTime(complaint.time || "");
    setDescription(complaint.description || "");
    setPriority(complaint.priority || "Medium");
    setStatus(complaint.status || "New");
    setRemarks(complaint.adminRemarks || "");
    setShowForm(true);
  };

  const closeComplaintForm = () => {
    setShowForm(false);
    resetComplaintForm();
  };

  const saveComplaint = async () => {
    if (!title || !description) {
      setError("Title and description are required");
      return;
    }
    if (!editingComplaint && !selectedUserId) {
      setError("Please choose a student");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingComplaint) {
        if (status !== editingComplaint.status) {
          await updateComplaintStatus(editingComplaint._id, status, auth.token);
        }
        if (remarks !== (editingComplaint.adminRemarks || "")) {
          await addAdminRemarks(editingComplaint._id, remarks, auth.token);
        }
        setSuccess("Complaint updated successfully.");
      } else {
        await createAdminComplaint(
          {
            userId: selectedUserId,
            title,
            place,
            date,
            time,
            description,
            priority,
          },
          auth.token
        );
        setSuccess("Complaint created successfully.");
      }

      closeComplaintForm();
      await fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save complaint");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteComplaint = async (complaint) => {
    const confirmed = window.confirm(`Delete complaint ${complaint.requestId}?`);
    if (!confirmed) return;

    try {
      setDeletingId(complaint._id);
      setError("");
      setSuccess("");
      await deleteAdminComplaint(complaint._id, auth.token);
      setSuccess("Complaint deleted successfully.");
      await fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete complaint");
    } finally {
      setDeletingId("");
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

  const openDetails = (complaintId) => {
    navigate(ROUTES.ADMIN_REQUEST_DETAILS(complaintId));
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
          <button className="btn btn-primary" type="button" onClick={openCreateForm}>
            + Create Complaint
          </button>
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
          {(error || success) && (
            <div className="dashboard-message-stack">
              {error && <div className="card error-text">{error}</div>}
              {success && <div className="card success-text">{success}</div>}
            </div>
          )}

          {activePanel === "analytics" ? (
            <section className="card analytics-dashboard-panel">
              <div className="card-header">
                <div>
                  <h3>Smart Analysis Dashboard</h3>
                  <p>Admin-scoped metrics and trends for your active complaint workspace</p>
                </div>
              </div>
              <section className="analytics-hero">
                <div>
                  <div className="analytics-kicker">Focused Admin Intelligence</div>
                  <h4>Professional overview of workload, resolution health, and live case movement.</h4>
                  <p className="subtext">
                    This dashboard only reflects complaints available to the current admin domain.
                  </p>
                </div>
                <div className="analytics-hero-rate">
                  <span>Resolution Rate</span>
                  <strong>{analyticsView.solvedRate.toFixed(0)}%</strong>
                  <div className="analytics-bar">
                    <span style={{ width: `${Math.min(100, analyticsView.solvedRate)}%` }} />
                  </div>
                </div>
              </section>

              <div className="analytics-grid analytics-grid-compact">
                <div className="analytics-card analytics-card-total">
                  <div className="analytics-label">Visible Complaints</div>
                  <div className="analytics-value">{analyticsView.total}</div>
                  <div className="analytics-sub">All complaints in your current scope</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-label">New Today</div>
                  <div className="analytics-value">{analyticsView.today}</div>
                  <div className="analytics-sub">Fresh incoming complaints today</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-label">Pending Queue</div>
                  <div className="analytics-value">{analyticsView.pendingCount}</div>
                  <div className="analytics-sub">Cases still needing admin progress</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-label">High Priority</div>
                  <div className="analytics-value">{analyticsView.highPriorityCount}</div>
                  <div className="analytics-sub">Cases that may need urgent attention</div>
                </div>
              </div>

              <div className="analytics-board">
                <div className="analytics-panel analytics-chart-panel">
                  <div className="analytics-panel-head">
                    <h4>Status Distribution</h4>
                    <span>{analyticsView.total} complaints</span>
                  </div>
                  <div className="analytics-chart-list">
                    {analyticsView.statusChart.map((item) => (
                      <div className="analytics-chart-row" key={item.label}>
                        <div className="analytics-chart-meta">
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                        <div className="analytics-track">
                          <span className={`tone-${item.tone}`} style={{ width: `${item.width}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-panel analytics-chart-panel">
                  <div className="analytics-panel-head">
                    <h4>Category Load</h4>
                    <span>Within your current scope</span>
                  </div>
                  {analyticsView.categoryChart.length ? (
                    <div className="analytics-chart-list">
                      {analyticsView.categoryChart.map((item) => (
                        <div className="analytics-chart-row" key={item.label}>
                          <div className="analytics-chart-meta">
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                          </div>
                          <div className="analytics-track">
                            <span className="tone-category" style={{ width: `${item.width}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty">No category data yet.</div>
                  )}
                </div>

                <div className="analytics-panel">
                  <div className="analytics-panel-head">
                    <h4>Admin Highlights</h4>
                    <span>Operational focus</span>
                  </div>
                  <div className="analytics-highlight-list">
                    <div className="analytics-highlight">
                      <span>Open workload</span>
                      <strong>{analyticsView.pendingCount} active complaints</strong>
                    </div>
                    <div className="analytics-highlight">
                      <span>Completed work</span>
                      <strong>{analyticsView.solvedCount} solved complaints</strong>
                    </div>
                    <div className="analytics-highlight">
                      <span>Attention load</span>
                      <strong>{analyticsView.highPriorityCount} high-priority complaints</strong>
                    </div>
                  </div>
                </div>

                <div className="analytics-panel">
                  <div className="analytics-panel-head">
                    <h4>Recent Admin Activity</h4>
                    <span>Latest updated complaints</span>
                  </div>
                  {analyticsView.recentActivity.length ? (
                    <div className="analytics-activity-list">
                      {analyticsView.recentActivity.map((item) => (
                        <div className="analytics-activity-item" key={item._id}>
                          <div>
                            <strong>{item.requestId}</strong>
                            <p>{item.title}</p>
                          </div>
                          <div className="analytics-activity-meta">
                            <span className={statusClass(item.status)}>{item.status}</span>
                            <small>{formatDateTime(item.updatedAt)}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty">No recent activity yet.</div>
                  )}
                </div>
              </div>
            </section>
          ) : (
            <section className="card complaints-panel">
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
              <div className="complaints-scroll">
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
                            <th>Actions</th>
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
                                <div className="table-actions">
                                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => openDetails(c._id)}>
                                    View Details
                                  </button>
                                  <button className="btn btn-muted btn-sm" type="button" onClick={() => openEditForm(c)}>
                                    Update
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    type="button"
                                    onClick={() => handleDeleteComplaint(c)}
                                    disabled={deletingId === c._id}
                                  >
                                    {deletingId === c._id ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
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
                            <button className="btn btn-ghost btn-sm" type="button" onClick={() => openDetails(c._id)}>
                              View Details
                            </button>
                            <button className="btn btn-muted btn-sm" type="button" onClick={() => openEditForm(c)}>
                              Update
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              type="button"
                              onClick={() => handleDeleteComplaint(c)}
                              disabled={deletingId === c._id}
                            >
                              {deletingId === c._id ? "Deleting..." : "Delete"}
                            </button>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
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

      {showForm && (
        <div className="modal-backdrop" onClick={closeComplaintForm}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{editingComplaint ? "Update Complaint" : "Create Complaint"}</h3>
                <p>
                  {editingComplaint
                    ? `${editingComplaint.requestId} - update complaint details`
                    : "Create a complaint for a selected student"}
                </p>
              </div>
              <button className="icon-btn" type="button" onClick={closeComplaintForm}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4Z" />
                </svg>
              </button>
            </div>
            <div className="form-grid">
              {!editingComplaint && (
                <>
                  <label className="field-label">Student</label>
                  <select
                    className="select"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Select student</option>
                    {studentUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </>
              )}
              {editingComplaint && (
                <div className="field-hint">
                  Admin update only changes complaint `status` and `remarks`. Complaint content stays as submitted by the user.
                </div>
              )}
              {!editingComplaint && (
                <>
                  <label className="field-label">Title</label>
                  <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <label className="field-label">Place</label>
                  <input className="input" value={place} onChange={(e) => setPlace(e.target.value)} />
                  <div className="inline-actions">
                    <div style={{ flex: 1 }}>
                      <label className="field-label">Date</label>
                      <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="field-label">Time</label>
                      <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
                    </div>
                  </div>
                  <label className="field-label">Priority</label>
                  <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                  <label className="field-label">Description</label>
                  <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
                </>
              )}
              {editingComplaint && (
                <>
                  <label className="field-label">Student</label>
                  <div className="field-hint">
                    {editingComplaint.userId?.name || "-"} ({editingComplaint.userId?.email || "-"})
                  </div>
                  <label className="field-label">Current Complaint</label>
                  <div className="field-hint">
                    <strong>{title}</strong><br />
                    {description || "No description"}
                  </div>
                  <label className="field-label">Status</label>
                  <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option>New</option>
                    <option>In Progress</option>
                    <option>Solved</option>
                  </select>
                  <label className="field-label">Admin Remarks</label>
                  <textarea className="textarea" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </>
              )}
              <button className="btn btn-primary" onClick={saveComplaint} disabled={saving}>
                {saving ? "Saving..." : (editingComplaint ? "Update Complaint" : "Create Complaint")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
