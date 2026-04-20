import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROUTES } from "../constants/paths";
import {
  addComplaintFeedback,
  createComplaint,
  deleteMyComplaint,
  getUserComplaints,
  updateMyComplaint,
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
const getSuggestions = (titleValue, descriptionValue) => {
  const text = `${titleValue} ${descriptionValue}`.toLowerCase();
  const suggestions = [];

  if (text.includes("network") || text.includes("wifi") || text.includes("internet")) {
    suggestions.push("Check WiFi settings and reconnect");
    suggestions.push("Restart your router or hotspot");
    suggestions.push("Contact lab assistant if the issue persists");
  }
  if (text.includes("fee") || text.includes("payment") || text.includes("receipt")) {
    suggestions.push("Verify payment status in the portal");
    suggestions.push("Attach your fee receipt for faster resolution");
  }
  if (text.includes("discipline") || text.includes("conduct")) {
    suggestions.push("Provide time and location of the incident");
  }
  if (text.includes("general") || text.includes("query") || text.includes("question")) {
    suggestions.push("Check the help center for common questions");
  }

  return Array.from(new Set(suggestions)).slice(0, 4);
};

export default function UserDashboard() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [attachment, setAttachment] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserComplaints(auth.token);
      setComplaints(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load complaints");
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  const resetComplaintForm = useCallback(() => {
    setTitle("");
    setPlace("");
    setDate("");
    setTime("");
    setDescription("");
    setPriority("Medium");
    setAttachment(null);
    setEditingComplaint(null);
  }, []);

  const submitComplaint = async () => {
    setError("");
    setSuccess("");
    if (!title || !place || !date || !time || !description) {
      setError("Title, place, date, time and description are required");
      return;
    }

    try {
      setSubmitting(true);
      if (editingComplaint) {
        await updateMyComplaint(
          editingComplaint._id,
          {
            title,
            place,
            date,
            time,
            description,
            priority,
          },
          auth.token
        );
        setSuccess("Complaint updated successfully.");
      } else {
        const payload = new FormData();
        payload.append("title", title);
        payload.append("place", place);
        payload.append("date", date);
        payload.append("time", time);
        payload.append("description", description);
        payload.append("priority", priority);
        if (attachment) {
          payload.append("attachment", attachment);
        }
        await createComplaint(payload, auth.token);
        setSuccess("Request submitted successfully.");
      }
      resetComplaintForm();
      setShowForm(false);
      loadComplaints();
    } catch (err) {
      setError(
        err.response?.data?.message
          || (editingComplaint ? "Unable to update complaint" : "Unable to submit complaint")
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!auth?.token) {
      navigate(ROUTES.LOGIN);
      return;
    }
    loadComplaints();
  }, [auth?.token, loadComplaints, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadComplaints();
    }, 20000);
    return () => clearInterval(interval);
  }, [loadComplaints]);

  const statusClass = (status) => {
    if (status === "New") return "pill pill-new";
    if (status === "In Progress") return "pill pill-progress";
    return "pill pill-solved";
  };

  const assignedTo = (category) => {
    if (category === "Networking") return "Network Admin";
    if (category === "Fees") return "Finance Admin";
    if (category === "Discipline") return "Discipline Admin";
    return "General Admin";
  };

  const filteredComplaints = complaints.filter((c) => (filter === "All" ? true : c.status === filter));
  const summary = {
    new: complaints.filter((c) => c.status === "New").length,
    progress: complaints.filter((c) => c.status === "In Progress").length,
    solved: complaints.filter((c) => c.status === "Solved").length,
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

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
    setAttachment(null);
    setShowForm(true);
  };

  const closeComplaintForm = () => {
    setShowForm(false);
    resetComplaintForm();
    setError("");
  };

  const handleDeleteComplaint = async (complaint) => {
    const confirmed = window.confirm(`Delete complaint ${complaint.requestId}?`);
    if (!confirmed) return;

    try {
      setDeletingId(complaint._id);
      setError("");
      setSuccess("");
      const response = await deleteMyComplaint(complaint._id, auth.token);
      setSuccess(response?.message || "Complaint removed from your dashboard.");
      if (editingComplaint?._id === complaint._id) {
        closeComplaintForm();
      }
      loadComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete complaint");
    } finally {
      setDeletingId("");
    }
  };

  const openFeedback = (complaint) => {
    setFeedbackTarget(complaint);
    setFeedbackRating(5);
    setFeedbackComment("");
    setFeedbackError("");
    setShowFeedback(true);
  };

  const saveFeedback = async () => {
    if (!feedbackTarget) return;
    try {
      setFeedbackSaving(true);
      await addComplaintFeedback(
        feedbackTarget._id,
        { rating: feedbackRating, comment: feedbackComment },
        auth.token
      );
      setShowFeedback(false);
      setFeedbackTarget(null);
      loadComplaints();
    } catch (err) {
      setFeedbackError(err.response?.data?.message || "Unable to save feedback");
    } finally {
      setFeedbackSaving(false);
    }
  };

  const latestAction = (complaint) => {
    if (!complaint?.statusHistory?.length) return "No actions yet";
    const last = complaint.statusHistory[complaint.statusHistory.length - 1];
    return `${last.action || "Update"} · ${formatDateTime(last.at)}`;
  };

  const openDetails = (complaintId) => {
    navigate(ROUTES.USER_REQUEST_DETAILS(complaintId));
  };

  const suggestions = getSuggestions(title, description);

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
            <div className="user-avatar">{auth?.user?.name?.[0] || "U"}</div>
            <div>
              <div className="user-name">{auth?.user?.name || "User"}</div>
              <div className="user-role">User</div>
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
            <h1>My Dashboard</h1>
            <p>Welcome back, {auth?.user?.name}</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={openCreateForm}
            type="button"
          >
            + New Complaint
          </button>
        </section>

        {showNotif && (
          <div className="notif-drawer">
            <div className="notif-drawer-backdrop" onClick={() => setShowNotif(false)} />
            <NotificationsPanel role="user" variant="drawer" onClose={() => setShowNotif(false)} />
          </div>
        )}

        <div className="dashboard-grid">
          <div className="dashboard-message-stack">
            {error && <div className="card error-text">{error}</div>}
            {success && <div className="card success-text">{success}</div>}
          </div>

          <section className="user-kpis">
            <div className="kpi-card kpi-new">
              <div className="kpi-icon">!</div>
              <div>
                <div className="kpi-value">{summary.new}</div>
                <div className="kpi-label">New</div>
              </div>
            </div>
            <div className="kpi-card kpi-progress">
              <div className="kpi-icon">T</div>
              <div>
                <div className="kpi-value">{summary.progress}</div>
                <div className="kpi-label">In Progress</div>
              </div>
            </div>
            <div className="kpi-card kpi-solved">
              <div className="kpi-icon">V</div>
              <div>
                <div className="kpi-value">{summary.solved}</div>
                <div className="kpi-label">Solved</div>
              </div>
            </div>
          </section>

          <section className="card complaints-panel">
            <div className="card-header">
              <div>
                <h3>My Complaints</h3>
                <p>{complaints.length} total complaints</p>
              </div>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="select filter-select">
                <option>All</option>
                <option>New</option>
                <option>In Progress</option>
                <option>Solved</option>
              </select>
            </div>
            <div className="complaints-scroll">
              {loading && <div className="empty">Loading requests...</div>}
              {!loading && filteredComplaints.length === 0 && (
                <div className="empty">No requests found for selected filter.</div>
              )}
              {!loading && filteredComplaints.length > 0 && (
                <>
                  <div className="table-wrap complaints-table-wrap">
                    <table className="table complaints-table complaints-table-user">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredComplaints.map((c) => (
                          <tr key={c._id}>
                            <td>{c.requestId}</td>
                            <td>{c.title}</td>
                            <td><span className="tag">{c.category}</span></td>
                            <td><span className={statusClass(c.status)}>{c.status}</span></td>
                            <td>{c.date || "-"}</td>
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
                          </div>
                          <div className="complaint-badges">
                            <span className={priorityBadgeClass(c.priority)}>{c.priority || "Medium"}</span>
                            <span className={statusClass(c.status)}>{c.status}</span>
                          </div>
                        </div>
                        <div className="complaint-meta">
                          <span className="tag">{c.category}</span>
                          <span className={priorityBadgeClass(c.priority)}>{c.priority || "Medium"}</span>
                          <span className="meta-text">{c.date || "-"}</span>
                        </div>
                        <div className="complaint-log">
                          <div><strong>Status:</strong> {c.status}</div>
                          <div><strong>Assigned:</strong> {assignedTo(c.category)}</div>
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
                          {c.feedback?.rating ? (
                            <div className="feedback-cell">
                              <span className="feedback-stars">{renderStars(c.feedback.rating)}</span>
                              <span className="feedback-text">{c.feedback.comment || "No comment"}</span>
                            </div>
                          ) : c.status === "Solved" ? (
                            <button className="btn btn-ghost btn-sm" type="button" onClick={() => openFeedback(c)}>
                              Give Feedback
                            </button>
                          ) : (
                            <span className="muted-row">Feedback available after solved</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {showForm && (
        <div className="modal-backdrop" onClick={closeComplaintForm}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{editingComplaint ? "Update Complaint" : "Submit a Complaint"}</h3>
                <p>
                  {editingComplaint
                    ? "Update your complaint details. Smart categorization will refresh automatically."
                    : "Describe your issue. It will be automatically categorized and assigned."}
                </p>
              </div>
              <button className="icon-btn" type="button" aria-label="Close" onClick={closeComplaintForm}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4Z" />
                </svg>
              </button>
            </div>
            <div className="form-grid">
              <label className="field-label">Title</label>
              <input
                placeholder="Brief title of your issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
              />
              <label className="field-label">Place</label>
              <input
                placeholder="Place / Location"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="input"
              />
              <div className="inline-actions">
                <div style={{ flex: 1 }}>
                  <label className="field-label">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="field-label">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
              <label className="field-label">Priority</label>
              <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <label className="field-label">Description</label>
              <textarea
                placeholder="Describe your complaint in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea"
              />
              {suggestions.length > 0 && (
                <div className="suggestion-box">
                  <div className="suggestion-title">Quick Suggestions</div>
                  <ul className="suggestion-list">
                    {suggestions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              <label className="field-label">Attachment (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                className="input"
                disabled={Boolean(editingComplaint)}
              />
              {editingComplaint && (
                <div className="field-hint">
                  Attachment updates are disabled here. You can still edit the complaint text and priority.
                </div>
              )}
              <button onClick={submitComplaint} className="btn btn-primary" disabled={submitting}>
                {submitting ? (editingComplaint ? "Updating..." : "Submitting...") : (editingComplaint ? "Update Complaint" : "Submit Complaint")}
              </button>
            </div>
            {error && <div className="error-text">{error}</div>}
            {success && <div className="success-text">{success}</div>}
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="modal-backdrop" onClick={() => setShowFeedback(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Rate Resolution</h3>
                <p>Let us know how satisfied you are with the resolution.</p>
              </div>
              <button className="icon-btn" type="button" aria-label="Close" onClick={() => setShowFeedback(false)}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4Z" />
                </svg>
              </button>
            </div>
            <div className="form-grid">
              <label className="field-label">Rating</label>
              <select className="select" value={feedbackRating} onChange={(e) => setFeedbackRating(Number(e.target.value))}>
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Okay</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Bad</option>
              </select>
              <label className="field-label">Comment</label>
              <textarea
                placeholder="Share feedback (optional)"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                className="textarea"
              />
              <button className="btn btn-primary" onClick={saveFeedback} disabled={feedbackSaving}>
                {feedbackSaving ? "Saving..." : "Submit Feedback"}
              </button>
              {feedbackError && <div className="error-text">{feedbackError}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
