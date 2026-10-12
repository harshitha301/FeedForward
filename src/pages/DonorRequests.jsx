
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  MapPin,
  Package,
  Building2,
  Utensils,
  Leaf,
} from "lucide-react";
import api from "../services/api";
import "./DonorRequests.css";

export default function DonorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function loadRequests() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/requests/donor-requests");
      setRequests(response.data.requests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load food requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateRequest(id, action) {
    setBusyId(id);
    setError("");
    setMessage("");

    try {
      await api.put(`/requests/${id}/${action}`);

      setMessage(
        action === "approve"
          ? "Food request approved successfully."
          : "Food request rejected successfully."
      );

      await loadRequests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update this request. Please try again."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="ff-dr-page">
      <header className="ff-dr-topbar">
        <Link to="/dashboard" className="ff-dr-brand">
          <span className="ff-dr-brand-icon">
            <Leaf size={25} />
          </span>
          <span>Feed<span>Forward</span></span>
        </Link>

        <Link to="/dashboard" className="ff-dr-back">
          <ArrowLeft size={17} />
          Dashboard
        </Link>
      </header>

      <section className="ff-dr-hero">
        <div className="ff-dr-hero-content">
          <span className="ff-dr-eyebrow">DONOR MANAGEMENT</span>
          <h1>Food Requests<span>.</span></h1>
          <p>
            Every request is an opportunity to make a difference.
            Review organization requests and decide what happens next.
          </p>

          <div className="ff-dr-hero-stat">
            <span className="ff-dr-stat-icon">
              <ClipboardCheck size={22} />
            </span>
            <span>
              <strong>{requests.length}</strong>
              <small>Total food requests</small>
            </span>
          </div>
        </div>

        <div className="ff-dr-hero-art">
          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85"
            alt="Fresh, nourishing food"
          />
          <div className="ff-dr-image-note">
            <Leaf size={18} />
            <span>Good Food. Better Impact.</span>
          </div>
        </div>
      </section>

      <section className="ff-dr-content">
        <div className="ff-dr-section-heading">
          <div>
            <span className="ff-dr-section-label">YOUR DONATIONS</span>
            <h2>Organization requests</h2>
            <p>Manage requests from food recipient organizations.</p>
          </div>

          <button
            className="ff-dr-refresh"
            onClick={loadRequests}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "ff-dr-spinning" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="ff-dr-alert ff-dr-alert-error">{error}</div>
        )}

        {message && (
          <div className="ff-dr-alert ff-dr-alert-success">
            <CheckCircle size={18} />
            {message}
          </div>
        )}

        {loading ? (
          <div className="ff-dr-empty">
            <RefreshCw size={28} className="ff-dr-spinning" />
            <h3>Loading requests...</h3>
            <p>Please wait while we fetch your requests.</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="ff-dr-empty">
            <span className="ff-dr-empty-icon">
              <ClipboardCheck size={34} />
            </span>
            <h3>No requests yet</h3>
            <p>
              When an organization requests your donated food, it will
              appear here.
            </p>
            <Link to="/food-donations" className="ff-dr-primary-link">
              View my donations
            </Link>
          </div>
        ) : (
          <div className="ff-dr-grid">
            {requests.map((request) => {
              const status = String(
                request.status || "REQUESTED"
              ).toUpperCase();

              const foodName =
                request.food_name || request.foodName || "Food donation";

              const organization =
                request.organization_name ||
                request.name ||
                "Recipient organization";

              const image = request.image;

              return (
                <article className="ff-dr-card" key={request.id}>
                  <div className="ff-dr-card-image">
                    {image ? (
                      <img src={image} alt={foodName} />
                    ) : (
                      <div className="ff-dr-image-placeholder">
                        <Utensils size={38} />
                        <span>Shared with care</span>
                      </div>
                    )}

                    <span
                      className={`ff-dr-status ff-dr-status-${status.toLowerCase()}`}
                    >
                      {status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="ff-dr-card-body">
                    <span className="ff-dr-card-label">FOOD REQUEST</span>
                    <h3>{foodName}</h3>

                    <div className="ff-dr-detail">
                      <Building2 size={17} />
                      <span>
                        <small>Organization</small>
                        <strong>{organization}</strong>
                      </span>
                    </div>

                    <div className="ff-dr-detail">
                      <Package size={17} />
                      <span>
                        <small>Quantity requested</small>
                        <strong>{request.quantity}</strong>
                      </span>
                    </div>

                    {request.location && (
                      <div className="ff-dr-detail">
                        <MapPin size={17} />
                        <span>
                          <small>Pickup / food location</small>
                          <strong>{request.location}</strong>
                        </span>
                      </div>
                    )}

                    {status === "REQUESTED" && (
                      <div className="ff-dr-actions">
                        <button
                          className="ff-dr-approve"
                          onClick={() => updateRequest(request.id, "approve")}
                          disabled={busyId !== null}
                        >
                          <CheckCircle size={17} />
                          {busyId === request.id ? "Updating..." : "Approve"}
                        </button>

                        <button
                          className="ff-dr-reject"
                          onClick={() => updateRequest(request.id, "reject")}
                          disabled={busyId !== null}
                        >
                          <XCircle size={17} />
                          Reject
                        </button>
                      </div>
                    )}

                    {status === "APPROVED" && (
                      <div className="ff-dr-status-note">
                        <CheckCircle size={17} />
                        Request approved — coordinate the food handover.
                      </div>
                    )}

                    {status === "DELIVERED" && (
                      <div className="ff-dr-status-note">
                        <Leaf size={17} />
                        Food handover completed. Thank you for helping!
                      </div>
                    )}

                    {status === "REJECTED" && (
                      <div className="ff-dr-status-note ff-dr-rejected-note">
                        This request was rejected.
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <footer className="ff-dr-footer">
          <Leaf size={17} />
          <span>Good Food. Better Impact.</span>
          <span className="ff-dr-footer-muted">
            Together, we can reduce food waste.
          </span>
        </footer>
      </section>
    </main>
  );
}