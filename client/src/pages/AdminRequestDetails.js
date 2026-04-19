import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROUTES } from "../constants/paths";
import { API_BASE_URL } from "../constants/apiPaths";
import {
  addAdminRemarks,
  getAdminComplaintById,
  updateComplaintStatus,
} from "../services/api";

export default function AdminRequestDetails() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState("New");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingRemarks, setSavingRemarks] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const data = await getAdminComplaintById(id, auth.token);
      setRequest(data);
      setStatus(data.status || "New");
      setRemarks(data.adminRemarks || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load request details");
    } finally {
      setLoading(false);
    }
  }, [id, auth.token]);

  useEffect(() => {
    if (!auth?.token || auth?.user?.role !== "admin") {
      navigate(ROUTES.LOGIN);
      return;
    }
    loadRequest();
  }, [auth?.token, auth?.user?.role, navigate, loadRequest]);

  const handleSaveStatus = async () => {
    try {
      setSavingStatus(true);
      setError("");
      setSuccess("");
      await updateComplaintStatus(id, status, auth.token);
      setSuccess("Status updated.");
      loadRequest();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveRemarks = async () => {
    try {
      setSavingRemarks(true);
      setError("");
      setSuccess("");
      await addAdminRemarks(id, remarks, auth.token);
      setSuccess("Remarks saved.");
      loadRequest();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save remarks");
    } finally {
      setSavingRemarks(false);
    }
  };

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
          <div className="empty">Request not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="panel detail-hero">
        <div className="detail-hero-main">
          <div className="detail-kicker">Admin Review Console</div>
          <h1>{request.title}</h1>
          <p className="subtext">Review the case, inspect supporting information, and update status with clear remarks.</p>
          <div className="detail-badges">
            <span className="tag">{request.requestId}</span>
            <span className="tag">{request.category}</span>
            <span className={statusClass(request.status)}>{request.status}</span>
            <span className="tag">Priority: {request.priority || "-"}</span>
          </div>
        </div>
        <div className="detail-hero-actions">
          <div className="detail-stat">
            <span>Submitted</span>
            <strong>{formatDateTime(request.createdAt)}</strong>
          </div>
          <div className="detail-stat">
            <span>Last Updated</span>
            <strong>{formatDateTime(request.updatedAt)}</strong>
          </div>
          <button className="btn btn-muted" type="button" onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}>
            Back to Dashboard
          </button>
        </div>
      </section>

      <div className="details-layout">
        <div className="panel panel-body detail-panel detail-primary">
          <div className="detail-section-head">
            <div>
              <h3>Case Summary</h3>
              <p className="subtext">Original complaint context submitted by the student.</p>
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
              <h3>Student Details</h3>
              <p className="subtext">Complaint owner and contact information.</p>
            </div>
          </div>
          <div className="details-grid detail-facts">
            <div className="detail-item">
              <span>Name</span>
              <strong>{request.userId?.name || "-"}</strong>
            </div>
            <div className="detail-item">
              <span>Email</span>
              <strong>{request.userId?.email || "-"}</strong>
            </div>
          </div>
        </div>

        <div className="panel panel-body detail-panel">
          <div className="detail-section-head">
            <div>
              <h3>Feedback Snapshot</h3>
              <p className="subtext">Resolution feedback shared by the student.</p>
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
              <p>{request.feedback?.comment || "No feedback yet"}</p>
            </div>
          </div>
        </div>

        <div className="panel panel-body detail-panel">
          <div className="detail-section-head">
            <div>
              <h3>Admin Actions</h3>
              <p className="subtext">Update workflow progress and communicate back with remarks.</p>
            </div>
          </div>
          {error && <div className="error-text">{error}</div>}
          {success && <div className="success-text">{success}</div>}
          <div className="form-grid detail-action-form">
            <div className="detail-action-row">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="select">
                <option>New</option>
                <option>In Progress</option>
                <option>Solved</option>
              </select>
              <button className="btn btn-primary" type="button" onClick={handleSaveStatus} disabled={savingStatus}>
                {savingStatus ? "Saving..." : "Save Status"}
              </button>
            </div>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="textarea"
              placeholder="Write remarks for the student"
            />
            <button className="btn btn-primary" type="button" onClick={handleSaveRemarks} disabled={savingRemarks}>
              {savingRemarks ? "Saving..." : "Save Remarks"}
            </button>
          </div>
        </div>

        <div className="panel panel-body detail-panel">
          <div className="detail-section-head">
            <div>
              <h3>Activity Timeline</h3>
              <p className="subtext">Every recorded update for this complaint, newest first.</p>
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
