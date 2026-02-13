import { useEffect, useMemo, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAdminComplaints } from "../services/api";

export default function AdminReports() {
  const { auth } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const data = await getAdminComplaints(auth.token);
        setComplaints(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load report data");
      }
    };

    load();
  }, [auth.token]);

  const summary = useMemo(() => {
    const total = complaints.length;
    const open = complaints.filter((c) => c.status !== "Solved").length;
    const solved = complaints.filter((c) => c.status === "Solved").length;
    const progress = complaints.filter((c) => c.status === "In Progress").length;
    const fresh = complaints.filter((c) => c.status === "New").length;

    const byCategory = complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});

    const byStatus = complaints.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const solvedItems = complaints.filter((c) => c.status === "Solved");
    const avgCloseHours = solvedItems.length === 0
      ? 0
      : solvedItems.reduce((acc, c) => {
        const start = new Date(c.createdAt).getTime();
        const end = new Date(c.updatedAt).getTime();
        return acc + Math.max((end - start) / (1000 * 60 * 60), 0);
      }, 0) / solvedItems.length;

    const resolutionRate = total === 0 ? 0 : (solved / total) * 100;

    const recent = [...complaints]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 8);

    return { total, open, solved, progress, fresh, byCategory, byStatus, avgCloseHours, resolutionRate, recent };
  }, [complaints]);

  return (
    <div className="page">
      <div className="panel panel-body">
        <h2 style={{ marginTop: 0 }}>Admin Reports</h2>
        <p className="subtext">Live operational metrics for complaint management.</p>
        {error && <div className="error-text">{error}</div>}

        <div className="stats-grid" style={{ marginTop: 12 }}>
          <div className="stat-card">
            <p>Total Requests</p>
            <h3>{summary.total}</h3>
          </div>
          <div className="stat-card">
            <p>Open Requests</p>
            <h3>{summary.open}</h3>
          </div>
          <div className="stat-card">
            <p>In Progress</p>
            <h3>{summary.progress}</h3>
          </div>
          <div className="stat-card">
            <p>Solved</p>
            <h3>{summary.solved}</h3>
          </div>
          <div className="stat-card">
            <p>New Queue</p>
            <h3>{summary.fresh}</h3>
          </div>
          <div className="stat-card">
            <p>Resolution Rate</p>
            <h3>{summary.resolutionRate.toFixed(1)}%</h3>
          </div>
          <div className="stat-card">
            <p>Avg. Close Time</p>
            <h3>{summary.avgCloseHours.toFixed(1)}h</h3>
          </div>
          <div className="stat-card">
            <p>Open Backlog</p>
            <h3>{summary.open}</h3>
          </div>
        </div>

        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Requests</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(summary.byCategory).length === 0 ? (
                <tr>
                  <td colSpan="2">No category data yet.</td>
                </tr>
              ) : (
                Object.entries(summary.byCategory).map(([category, count]) => (
                  <tr key={category}>
                    <td>{category}</td>
                    <td>{count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Requests</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(summary.byStatus).length === 0 ? (
                <tr>
                  <td colSpan="2">No status data yet.</td>
                </tr>
              ) : (
                Object.entries(summary.byStatus).map(([status, count]) => (
                  <tr key={status}>
                    <td>{status}</td>
                    <td>{count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Title</th>
                <th>Place</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {summary.recent.length === 0 ? (
                <tr>
                  <td colSpan="5">No recent activity.</td>
                </tr>
              ) : (
                summary.recent.map((c) => (
                  <tr key={c._id}>
                    <td>{c.requestId}</td>
                    <td>{c.title}</td>
                    <td>{c.place || "-"}</td>
                    <td>{c.status}</td>
                    <td>{new Date(c.updatedAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="info-banner" style={{ marginTop: 14 }}>
          Tip: Keep more requests in <strong>In Progress</strong> and <strong>Solved</strong> states by adding clear remarks during each update.
        </div>
      </div>
    </div>
  );
}
