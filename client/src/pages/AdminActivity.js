import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAdminComplaints } from "../services/api";

export default function AdminActivity() {
  const { auth } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAdminComplaints(auth.token);
        setComplaints(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load activity");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [auth.token]);

  const activity = useMemo(() => {
    const rows = [...complaints]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 12);

    const now = Date.now();
    const overdue = complaints.filter((c) => c.status !== "Solved" && (now - new Date(c.createdAt).getTime()) > 48 * 3600 * 1000).length;

    return { rows, overdue };
  }, [complaints]);

  const statusClass = (status) => {
    if (status === "New") return "pill pill-new";
    if (status === "In Progress") return "pill pill-progress";
    return "pill pill-solved";
  };

  return (
    <div className="page">
      <div className="panel panel-body">
        <h2 style={{ marginTop: 0 }}>Admin Activity</h2>
        <p className="subtext">Recent updates and overdue tracking for open requests.</p>
        {error && <div className="error-text">{error}</div>}
        {loading && <div className="empty">Loading activity...</div>}

        <div className="info-banner" style={{ marginTop: 12 }}>
          Overdue Open Requests (&gt;48h): <strong>{activity.overdue}</strong>
        </div>

        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Category</th>
                <th>Updated Time</th>
              </tr>
            </thead>
            <tbody>
              {activity.rows.length === 0 ? (
                <tr><td colSpan="5">No recent activity.</td></tr>
              ) : activity.rows.map((c) => (
                <tr key={c._id}>
                  <td>{c.requestId}</td>
                  <td>{c.title}</td>
                  <td><span className={statusClass(c.status)}>{c.status}</span></td>
                  <td>{c.category}</td>
                  <td>{new Date(c.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
