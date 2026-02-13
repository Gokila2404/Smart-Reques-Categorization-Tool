import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAdminComplaints, updateComplaintStatus } from "../services/api";

export default function AdminQueue() {
  const { auth } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminComplaints(auth.token);
      setComplaints(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load queue");
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const grouped = useMemo(() => {
    const searched = complaints.filter((c) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        c.title?.toLowerCase().includes(q)
        || c.requestId?.toLowerCase().includes(q)
        || c.category?.toLowerCase().includes(q)
        || c.place?.toLowerCase().includes(q)
      );
    });
    return {
      New: searched.filter((c) => c.status === "New"),
      "In Progress": searched.filter((c) => c.status === "In Progress"),
      Solved: searched.filter((c) => c.status === "Solved"),
    };
  }, [complaints, search]);

  const quickMove = async (id, status) => {
    try {
      await updateComplaintStatus(id, status, auth.token);
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to move queue item");
    }
  };

  return (
    <div className="page">
      <div className="panel panel-body">
        <h2 style={{ marginTop: 0 }}>Admin Queue Board</h2>
        <p className="subtext">Kanban-style queue for quick request triage and movement.</p>
        <input
          className="input"
          placeholder="Search by request ID, title, category, place"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginTop: 10 }}
        />
        {error && <div className="error-text">{error}</div>}
        {loading && <div className="empty" style={{ marginTop: 12 }}>Loading queue...</div>}

        {!loading && (
          <div className="kanban-grid" style={{ marginTop: 12 }}>
            {Object.entries(grouped).map(([column, items]) => (
              <section key={column} className="kanban-col">
                <h3>{column} ({items.length})</h3>
                {items.length === 0 ? (
                  <div className="empty">No items</div>
                ) : items.map((c) => (
                  <article key={c._id} className="kanban-card">
                    <p className="request-title">{c.title}</p>
                    <p className="muted-row">{c.requestId} | {c.category}</p>
                    <p className="muted-row">{c.place || "-"} | {c.date || "-"} {c.time || ""}</p>
                    <p>{c.description}</p>
                    <div className="inline-actions">
                      {column === "New" && (
                        <button className="btn btn-primary" onClick={() => quickMove(c._id, "In Progress")}>Start</button>
                      )}
                      {column === "In Progress" && (
                        <button className="btn btn-primary" onClick={() => quickMove(c._id, "Solved")}>Resolve</button>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
