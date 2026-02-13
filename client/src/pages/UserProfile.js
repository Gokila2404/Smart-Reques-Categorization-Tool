import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getUserComplaints } from "../services/api";

export default function UserProfile() {
  const { auth } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getUserComplaints(auth.token);
        setComplaints(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load profile data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [auth.token]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const solved = complaints.filter((c) => c.status === "Solved").length;
    const inProgress = complaints.filter((c) => c.status === "In Progress").length;
    const newReq = complaints.filter((c) => c.status === "New").length;
    return { total, solved, inProgress, newReq };
  }, [complaints]);

  const recent = useMemo(
    () => [...complaints].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5),
    [complaints]
  );

  return (
    <div className="page">
      <div className="panel panel-body">
        <h2 style={{ marginTop: 0 }}>My Profile</h2>
        <p className="subtext">Account details and request activity summary.</p>
        {error && <div className="error-text">{error}</div>}

        <div className="profile-grid" style={{ marginTop: 12 }}>
          <section className="info-card">
            <h3>Account</h3>
            <div className="meta-list">
              <p><strong>Name:</strong> {auth?.user?.name}</p>
              <p><strong>Email:</strong> {auth?.user?.email}</p>
              <p><strong>Role:</strong> {auth?.user?.role}</p>
              <p><strong>Status:</strong> Active</p>
            </div>
          </section>

          <section className="info-card">
            <h3>Request Snapshot</h3>
            {loading ? (
              <div className="empty">Loading profile metrics...</div>
            ) : (
              <div className="stats-grid stats-grid-compact">
                <div className="stat-card"><p>Total</p><h3>{stats.total}</h3></div>
                <div className="stat-card"><p>New</p><h3>{stats.newReq}</h3></div>
                <div className="stat-card"><p>Progress</p><h3>{stats.inProgress}</h3></div>
                <div className="stat-card"><p>Solved</p><h3>{stats.solved}</h3></div>
              </div>
            )}
          </section>
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
              {recent.length === 0 ? (
                <tr><td colSpan="5">No requests submitted yet.</td></tr>
              ) : recent.map((item) => (
                <tr key={item._id}>
                  <td>{item.requestId}</td>
                  <td>{item.title}</td>
                  <td>{item.place || "-"}</td>
                  <td>{item.status}</td>
                  <td>{new Date(item.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
