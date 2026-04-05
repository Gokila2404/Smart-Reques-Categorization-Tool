import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROUTES } from "../constants/paths";
import { getMyComplaintById } from "../services/api";

export default function UserRequestDetails() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <div className="panel topbar">
        <div>
          <h2>My Request Details</h2>
          <div className="subtext">Full request view with assignment and remarks.</div>
        </div>
        <button className="btn btn-muted" type="button" onClick={() => navigate(ROUTES.USER_DASHBOARD)}>
          Back to Dashboard
        </button>
      </div>

      <div className="details-layout">
        <div className="panel panel-body">
          <h3 style={{ marginTop: 0 }}>Request Information</h3>
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
          <h3 style={{ marginTop: 0 }}>Registered User</h3>
          <div className="details-grid">
            <p><strong>Name:</strong> {request.userId?.name || auth?.user?.name || "-"}</p>
            <p><strong>Email:</strong> {request.userId?.email || auth?.user?.email || "-"}</p>
          </div>
        </div>

        <div className="panel panel-body">
          <h3 style={{ marginTop: 0 }}>Assignment and Remarks</h3>
          <div className="details-grid">
            <p><strong>Assigned Admin:</strong> {request.adminId?.name || "Not assigned"}</p>
            <p><strong>Admin Email:</strong> {request.adminId?.email || "-"}</p>
            <p className="details-row-full">
              <strong>Admin Remarks:</strong> {request.adminRemarks || "No remarks yet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
