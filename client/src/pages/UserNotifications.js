import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getUserComplaints } from "../services/api";

export default function UserNotifications() {
  const { auth } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getUserComplaints(auth.token);

        const normalized = data.map((c) => ({
          id: c._id,
          title: `Status update for ${c.requestId}`,
          message: c.adminRemarks || "No remarks yet. Your request is in queue.",
          status: c.status,
          time: c.updatedAt,
        }));

        setItems(normalized.sort((a, b) => new Date(b.time) - new Date(a.time)));
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load notifications");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [auth.token]);

  const statusClass = (status) => {
    if (status === "New") return "pill pill-new";
    if (status === "In Progress") return "pill pill-progress";
    return "pill pill-solved";
  };

  const filteredItems = items.filter((item) => (filter === "All" ? true : item.status === filter));

  return (
    <div className="page">
      <div className="panel panel-body">
        <h2 style={{ marginTop: 0 }}>My Notifications</h2>
        <p className="subtext">Recent updates about your submitted complaints.</p>
        <div className="section-title-row">
          <p className="subtext" style={{ margin: 0 }}>Total Updates: {items.length}</p>
          <select className="select filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>New</option>
            <option>In Progress</option>
            <option>Solved</option>
          </select>
        </div>
        {error && <div className="error-text">{error}</div>}
        {loading && <div className="empty" style={{ marginTop: 12 }}>Loading notifications...</div>}

        {!loading && filteredItems.length === 0 ? (
          <div className="empty" style={{ marginTop: 12 }}>No notification updates yet.</div>
        ) : (
          <div className="request-list" style={{ marginTop: 12 }}>
            {filteredItems.map((item) => (
              <div key={item.id} className="request-card">
                <div className="request-head">
                  <p className="request-title">{item.title}</p>
                  <span className={statusClass(item.status)}>{item.status}</span>
                </div>
                <p>{item.message}</p>
                <div className="muted-row">Updated: {new Date(item.time).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
