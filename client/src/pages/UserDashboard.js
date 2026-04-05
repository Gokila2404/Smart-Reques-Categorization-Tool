import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROUTES } from "../constants/paths";
import { createComplaint, getUserComplaints } from "../services/api";
import NotificationsPanel from "../components/NotificationsPanel";

export default function UserDashboard() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

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

  const submitComplaint = async () => {
    setError("");
    setSuccess("");
    if (!title || !place || !date || !time || !description) {
      setError("Title, place, date, time and description are required");
      return;
    }

    try {
      setSubmitting(true);
      await createComplaint({ title, place, date, time, description }, auth.token);
      setTitle("");
      setPlace("");
      setDate("");
      setTime("");
      setDescription("");
      setSuccess("Request submitted successfully.");
      loadComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit complaint");
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
              <path fill="currentColor" d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z"/>
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
              <path fill="currentColor" d="M14 7V5H5v14h9v-2H7V7h7Zm3.59 5-2.3 2.29 1.41 1.42L21.41 12l-4.71-3.71-1.41 1.42 2.3 2.29H10v2h7.59Z"/>
            </svg>
          </button>
        </div>
      </header>

      <section className="user-hero">
        <div>
          <h1>My Dashboard</h1>
          <p>Welcome back, {auth?.user?.name}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm((prev) => !prev);
          }}
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

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Submit a Complaint</h3>
                <p>Describe your issue. It will be automatically categorized and assigned.</p>
              </div>
              <button className="icon-btn" type="button" aria-label="Close" onClick={() => setShowForm(false)}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4Z"/>
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
              <label className="field-label">Description</label>
              <textarea
                placeholder="Describe your complaint in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea"
              />
              <button onClick={submitComplaint} className="btn btn-primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
            {error && <div className="error-text">{error}</div>}
            {success && <div className="success-text">{success}</div>}
          </div>
        </div>
      )}

      <section className="card">
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
        {loading && <div className="empty">Loading requests...</div>}
        {!loading && filteredComplaints.length === 0 && (
          <div className="empty">No requests found for selected filter.</div>
        )}
        {!loading && filteredComplaints.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Assigned To</th>
                  <th>Remarks</th>
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
                    <td>{assignedTo(c.category)}</td>
                    <td>{c.adminRemarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
