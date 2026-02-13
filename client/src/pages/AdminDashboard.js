import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROUTES } from "../constants/paths";
import { addAdminRemarks, getAdminComplaints, updateComplaintStatus } from "../services/api";

const AdminDashboard = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");

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

  useEffect(() => {
    if (!auth?.token || auth?.user?.role !== "admin") {
      navigate(ROUTES.LOGIN);
      return;
    }
    fetchComplaints();
  }, [auth?.token, auth?.user?.role, fetchComplaints, navigate]);

  const handleStatusChange = async (id, status) => {
    try {
      setError("");
      setSuccess("");
      await updateComplaintStatus(id, status, auth.token);
      setSuccess("Status updated successfully.");
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update status");
    }
  };

  const handleAddRemarks = async (id) => {
    try {
      setError("");
      setSuccess("");
      await addAdminRemarks(id, remarks[id] || "", auth.token);
      setRemarks({ ...remarks, [id]: "" });
      setSuccess("Admin remarks saved.");
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save remarks");
    }
  };

  const statusClass = (status) => {
    if (status === "New") return "status-chip new";
    if (status === "In Progress") return "status-chip progress";
    return "status-chip solved";
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
          <h2>Admin Dashboard, {auth?.user?.name}</h2>
          <div className="subtext">
            Domain: {auth?.user?.adminDomain || "General"} 
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: 14 }}>
        <div className="stat-card"><p>Total Assigned</p><h3>{summary.total}</h3></div>
        <div className="stat-card"><p>New Queue</p><h3>{summary.new}</h3></div>
        <div className="stat-card"><p>In Progress</p><h3>{summary.progress}</h3></div>
        <div className="stat-card"><p>Solved</p><h3>{summary.solved}</h3></div>
      </div>

      <div className="panel panel-body" style={{ marginTop: 16 }}>
        {error && <div className="error-text">{error}</div>}
        {success && <div className="success-text">{success}</div>}
        <div className="section-title-row">
          <h3 style={{ margin: 0 }}>Assigned Requests</h3>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="select filter-select">
            <option>All</option>
            <option>New</option>
            <option>In Progress</option>
            <option>Solved</option>
          </select>
        </div>
        {loading ? (
          <div className="empty">Loading assigned requests...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty">No complaints assigned currently.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Admin Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => (
                  <tr key={c._id}>
                    <td>{c.requestId}</td>
                    <td>
                      <strong>{c.title}</strong>
                      <div className="subtext">{c.description}</div>
                    </td>
                    <td>{c.category}</td>
                    <td className={statusClass(c.status)}>{c.status}</td>
                    <td>{c.adminRemarks || "-"}</td>
                    <td>
                      <div className="inline-actions">
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(c._id, e.target.value)}
                          className="select"
                        >
                          <option>New</option>
                          <option>In Progress</option>
                          <option>Solved</option>
                        </select>
                        <input
                          type="text"
                          value={remarks[c._id] || ""}
                          onChange={(e) => setRemarks({ ...remarks, [c._id]: e.target.value })}
                          placeholder="Add remarks"
                          className="input remarks-input"
                        />
                        <button onClick={() => handleAddRemarks(c._id)} className="btn btn-primary">Save</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
