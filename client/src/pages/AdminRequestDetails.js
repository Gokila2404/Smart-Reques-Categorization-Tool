import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROUTES } from "../constants/paths";
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
      <div className="panel topbar">
        <div>
          <h2>Request Details</h2>
          <div className="subtext">Complete information for review and action.</div>
        </div>
        <button className="btn btn-muted" type="button" onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}>
          Back to Dashboard
        </button>
      </div>

      <div className="details-layout">
        <div className="panel panel-body">
          <h3 style={{ marginTop: 0 }}>Main Information</h3>
          <div className="details-grid">
            <p><strong>Request ID:</strong> {request.requestId}</p>
            <p><strong>Title:</strong> {request.title}</p>
            <p><strong>Category:</strong> {request.category}</p>
            <p><strong>Status:</strong> {request.status}</p>
            <p><strong>Place:</strong> {request.place || "-"}</p>
            <p><strong>Date:</strong> {request.date || "-"}</p>
            <p><strong>Time:</strong> {request.time || "-"}</p>
            <p><strong>Created:</strong> {new Date(request.createdAt).toLocaleString()}</p>
            <p className="details-row-full"><strong>Description:</strong> {request.description}</p>
          </div>
        </div>

        <div className="panel panel-body">
          <h3 style={{ marginTop: 0 }}>Student Details</h3>
          <div className="details-grid">
            <p><strong>Name:</strong> {request.userId?.name || "-"}</p>
            <p><strong>Email:</strong> {request.userId?.email || "-"}</p>
          </div>
        </div>

        <div className="panel panel-body">
          <h3 style={{ marginTop: 0 }}>Actions</h3>
          {error && <div className="error-text">{error}</div>}
          {success && <div className="success-text">{success}</div>}
          <div className="form-grid">
            <div className="inline-actions">
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
      </div>
    </div>
  );
}
