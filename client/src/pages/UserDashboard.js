import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROUTES } from "../constants/paths";
import { createComplaint, getUserComplaints } from "../services/api";

export default function UserDashboard() {
  const { auth } = useContext(AuthContext);
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

  return (
    <div className="page">
      <div className="panel topbar">
        <div>
          <h2>User Dashboard, {auth?.user?.name}</h2>
          <div className="subtext">Submit requests and track resolution status in one place</div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: 14 }}>
        <div className="stat-card"><p>Total Requests</p><h3>{summary.total}</h3></div>
        <div className="stat-card"><p>New</p><h3>{summary.new}</h3></div>
        <div className="stat-card"><p>In Progress</p><h3>{summary.progress}</h3></div>
        <div className="stat-card"><p>Solved</p><h3>{summary.solved}</h3></div>
      </div>

      <div className="layout">
        <div className="panel panel-body">
          <h3 style={{ marginTop: 0 }}>Create Complaint</h3>
          <p className="subtext">Provide complete details for faster categorization and assignment.</p>
          <div className="form-grid">
            <input
              placeholder="Complaint title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
            <input
              placeholder="Place / Location"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="input"
            />
            <div className="inline-actions">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input"
              />
            </div>
            <textarea
              placeholder="Describe your issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea"
            />
            <button onClick={submitComplaint} className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
          {error && <div className="error-text">{error}</div>}
          {success && <div className="success-text">{success}</div>}
        </div>

        <div className="panel panel-body">
          <div className="section-title-row">
            <h3 style={{ marginTop: 0 }}>My Requests</h3>
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
                    <th>Request ID</th>
                    <th>Title</th>
                    <th>Place</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Admin Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((c) => (
                    <tr key={c._id}>
                      <td>{c.requestId}</td>
                      <td>{c.title}</td>
                      <td>{c.place || "-"}</td>
                      <td>{c.date || "-"}</td>
                      <td>{c.time || "-"}</td>
                      <td>{c.category}</td>
                      <td><span className={statusClass(c.status)}>{c.status}</span></td>
                      <td>{c.description}</td>
                      <td>{c.adminRemarks || "No remarks yet"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
