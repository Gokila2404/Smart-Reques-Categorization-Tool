import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROUTES } from "../constants/paths";
import { API_BASE_URL } from "../constants/apiPaths";
import { getMyComplaintById } from "../services/api";

export default function UserRequestDetails() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const resolveAttachmentUrl = (attachmentUrl) => {
    if (!attachmentUrl) return "";
    if (attachmentUrl.startsWith("http")) return attachmentUrl;
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${baseUrl}${attachmentUrl}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const statusClass = (statusValue) => {
    if (statusValue === "New") return "pill pill-new";
    if (statusValue === "In Progress") return "pill pill-progress";
    return "pill pill-solved";
  };

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyComplaintById(id, auth.token);
      setRequest(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load request details");
    } finally {
      setLoading(false);
    }
  }, [id, auth.token]);

  useEffect(() => {
    if (!auth?.token || auth?.user?.role !== "user") {
      navigate(ROUTES.LOGIN);
      return;
    }
    loadRequest();
  }, [auth?.token, auth?.user?.role, navigate, loadRequest]);

  if (loading) {
    return (
      <div className="page">
        <div className="panel panel-body">
          <div className="empty">Loading request details...</div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="page">
        <div className="panel panel-body">
          <div className="empty">{error || "Request not found."}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="panel detail-hero">
        <div className="detail-hero-main">
          <div className="detail-kicker">Complaint Case File</div>
          <h1>{request.title}</h1>
          <p className="subtext">Track progress, review remarks, and inspect the full request history in one place.</p>
          <div className="detail-badges">
            <span className="tag">{request.requestId}</span>
            <span className="tag">{request.category}</span>
            <span className={statusClass(request.status)}>{request.status}</span>
            <span className="tag">Priority: {request.priority || "-"}</span>
          </div>
        </div>
        <div className="detail-hero-actions">
          <div className="detail-stat">
            <span>Created</span>
            <strong>{formatDateTime(request.createdAt)}</strong>
          </div>
          <div className="detail-stat">
            <span>Last Updated</span>
            <strong>{formatDateTime(request.updatedAt)}</strong>
          </div>
          <button className="btn btn-muted" type="button" onClick={() => navigate(ROUTES.USER_DASHBOARD)}>
            Back to Dashboard
          </button>
        </div>
      </section>

      <div className="details-layout">
        <div className="panel panel-body detail-panel detail-primary">
          <div className="detail-section-head">
            <div>
              <h3>Request Summary</h3>
              <p className="subtext">Core complaint information submitted by you.</p>
            </div>
          </div>
          <div className="details-grid detail-facts">
            <div className="detail-item">
              <span>Location</span>
              <strong>{request.place || "-"}</strong>
            </div>
            <div className="detail-item">
              <span>Date</span>
              <strong>{request.date || "-"}</strong>
            </div>
            <div className="detail-item">
              <span>Time</span>
              <strong>{request.time || "-"}</strong>
            </div>
            <div className="detail-item">
              <span>Attachment</span>
              <strong>
                {request.attachment?.url ? (
                  <a href={resolveAttachmentUrl(request.attachment.url)} target="_blank" rel="noreferrer">View file</a>
                ) : (
                  "No attachment"
                )}
              </strong>
            </div>
            <div className="detail-note details-row-full">
              <span>Description</span>
              <p>{request.description}</p>
            </div>
          </div>
        </div>

        <div className="panel panel-body detail-panel">
          <div className="detail-section-head">
            <div>
              <h3>Submitted By</h3>
              <p className="subtext">Owner information for this complaint.</p>
            </div>
          </div>
          <div className="details-grid detail-facts">
            <div className="detail-item">
              <span>Name</span>
              <strong>{request.userId?.name || auth?.user?.name || "-"}</strong>
            </div>
            <div className="detail-item">
              <span>Email</span>
              <strong>{request.userId?.email || auth?.user?.email || "-"}</strong>
            </div>
          </div>
        </div>

        <div className="panel panel-body detail-panel">
          <div className="detail-section-head">
            <div>
              <h3>Assignment and Remarks</h3>
              <p className="subtext">Current admin ownership and latest response.</p>
            </div>
          </div>
          <div className="details-grid detail-facts">
            <div className="detail-item">
              <span>Assigned Admin</span>
              <strong>{request.adminId?.name || "Not assigned"}</strong>
            </div>
            <div className="detail-item">
              <span>Admin Email</span>
              <strong>{request.adminId?.email || "-"}</strong>
            </div>
            <div className="detail-note details-row-full">
              <span>Admin Remarks</span>
              <p>{request.adminRemarks || "No remarks yet"}</p>
            </div>
          </div>
        </div>

        <div className="panel panel-body detail-panel">
          <div className="detail-section-head">
            <div>
              <h3>Feedback</h3>
              <p className="subtext">Your resolution feedback, when available.</p>
            </div>
          </div>
          <div className="details-grid detail-facts">
            <div className="detail-item">
              <span>Rating</span>
              <strong>{request.feedback?.rating ? `${request.feedback.rating}/5` : "Not submitted"}</strong>
            </div>
            <div className="detail-item">
              <span>Submitted</span>
              <strong>{request.feedback?.submittedAt ? formatDateTime(request.feedback.submittedAt) : "-"}</strong>
            </div>
            <div className="detail-note details-row-full">
              <span>Comment</span>
              <p>{request.feedback?.comment || "No feedback comment"}</p>
            </div>
          </div>
        </div>

        <div className="panel panel-body detail-panel">
          <div className="detail-section-head">
            <div>
              <h3>Activity Timeline</h3>
              <p className="subtext">A chronological record of updates on this complaint.</p>
            </div>
          </div>
          {request.statusHistory?.length ? (
            <div className="detail-timeline">
              {[...request.statusHistory].reverse().map((item, index) => (
                <div className="timeline-item" key={`${item.at || item.createdAt || index}-${index}`}>
                  <div className="timeline-dot" />
                  <div className="timeline-card">
                    <div className="request-head">
                      <p className="request-title">{item.action || "Update"}</p>
                      <span className="tag">{item.status || request.status}</span>
                    </div>
                    <div className="muted-row">{item.note || "No note available"}</div>
                    <div className="timeline-time">{formatDateTime(item.at || item.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No activity recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
