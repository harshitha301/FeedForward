
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  RefreshCw,
  PackageCheck,
  Truck,
  CheckCircle,
  MapPin,
  CalendarDays,
  Utensils,
  Clock3,
  Leaf,
  AlertCircle,
  CheckCircle2,
  Inbox,
  Image as ImageIcon,
} from "lucide-react";
import api from "../services/api";
import "./MyRequests.css";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function loadRequests() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/requests/my-requests");
      setRequests(response.data.requests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateStatus(id, action) {
    setBusyId(id);
    setError("");
    setMessage("");

    try {
      await api.put(`/requests/${id}/${action}`);

      setMessage(
        action === "pickup"
          ? "Food pickup has been recorded successfully."
          : "Food delivery has been marked as completed."
      );

      await loadRequests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update the request status. Please try again."
      );
    } finally {
      setBusyId(null);
    }
  }

  function statusClass(status) {
    return `ff-request-status status-${String(status || "")
      .toLowerCase()
      .replaceAll("_", "-")}`;
  }

  function formatDate(date) {
    if (!date) return "";
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return String(date).slice(0, 10);
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const activeCount = requests.filter((request) =>
    ["REQUESTED", "APPROVED", "PICKED_UP"].includes(
      String(request.status || "REQUESTED").toUpperCase()
    )
  ).length;

  return (
    <main className="ff-requests-page">
      <header className="ff-requests-nav">
        <Link to="/dashboard" className="ff-requests-brand">
          <span className="ff-requests-brand-icon">
            <Leaf size={25} />
          </span>
          <span>
            Feed<span>Forward</span>
          </span>
        </Link>

        <Link to="/dashboard" className="ff-requests-back">
          <ArrowLeft size={17} />
          Dashboard
        </Link>
      </header>

      <div className="ff-requests-container">
        <section className="ff-requests-hero">
          <div className="ff-requests-hero-copy">
            <span className="ff-requests-eyebrow">
              <Leaf size={14} /> YOUR FOOD JOURNEY
            </span>

            <h1>My Food Requests</h1>

            <p>
              Every request brings good food closer to someone who needs it.
              Track your collection and delivery progress here.
            </p>

            <div className="ff-requests-impact">
              <span className="ff-requests-impact-icon">
                <HeartIcon />
              </span>
              <span>
                <strong>{activeCount} active</strong>
                <small>requests in progress</small>
              </span>
            </div>
          </div>

          <div className="ff-requests-hero-art" aria-hidden="true">
            <div className="ff-requests-art-circle">
              <ClipboardList size={86} strokeWidth={1.4} />
              <span className="ff-requests-art-check">
                <CheckCircle2 size={35} />
              </span>
              <span className="ff-requests-art-leaf">
                <Leaf size={37} />
              </span>
            </div>
            <span className="ff-requests-art-caption">
              Good food. Better impact.
            </span>
          </div>
        </section>

        <section className="ff-requests-summary">
          <div className="ff-requests-summary-icon">
            <ClipboardList size={24} />
          </div>

          <div className="ff-requests-summary-copy">
            <strong>{requests.length}</strong>
            <span>Total food requests</span>
          </div>

          <span className="ff-requests-summary-note">
            <span className="ff-requests-live-dot" />
            Your journey, in one place
          </span>

          <button
            type="button"
            className="ff-requests-refresh"
            onClick={loadRequests}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "ff-requests-spinning" : ""}
            />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </section>

        {error && (
          <div
            className="ff-requests-alert ff-requests-alert-error"
            role="alert"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {message && (
          <div
            className="ff-requests-alert ff-requests-alert-success"
            role="status"
          >
            <CheckCircle size={20} />
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <section className="ff-requests-section-heading">
          <div>
            <span className="ff-requests-section-kicker">
              STAY UP TO DATE
            </span>
            <h2>Your requests</h2>
            <p>Follow each donation from approval to delivery.</p>
          </div>

          <span className="ff-requests-count">
            {requests.length}{" "}
            {requests.length === 1 ? "request" : "requests"}
          </span>
        </section>

        {loading ? (
          <div className="ff-requests-state">
            <span className="ff-requests-loader">
              <RefreshCw size={28} />
            </span>
            <h3>Loading your requests</h3>
            <p>Just a moment while we fetch your latest updates.</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="ff-requests-empty">
            <div className="ff-requests-empty-art">
              <Inbox size={43} />
              <span>
                <Leaf size={21} />
              </span>
            </div>

            <span className="ff-requests-eyebrow">A FRESH START</span>
            <h3>No food requests yet</h3>
            <p>
              Explore available food donations and request surplus food
              for your organization.
            </p>

            <Link to="/available-food" className="ff-requests-primary-link">
              Explore available food <ArrowLeft size={17} />
            </Link>
          </div>
        ) : (
          <section className="ff-requests-list">
            {requests.map((request) => {
              const status = String(
                request.status || "REQUESTED"
              ).toUpperCase();

              const foodName =
                request.food_name || request.foodName || "Food donation";

              const location =
                request.location || request.food_location;

              // The request API may use any of these image field names.
              const foodImage =
                request.image ||
                request.food_image ||
                request.foodImage ||
                "";

              return (
                <article className="ff-request-card" key={request.id}>
                  <div className="ff-request-card-top">
                    <div className="ff-request-food-photo">
                      {foodImage ? (
                        <img
                          src={foodImage}
                          alt={foodName}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            event.currentTarget.nextElementSibling?.classList.add(
                              "ff-request-photo-fallback-visible"
                            );
                          }}
                        />
                      ) : null}

                      <div
                        className={`ff-request-photo-fallback ${
                          foodImage
                            ? ""
                            : "ff-request-photo-fallback-visible"
                        }`}
                      >
                        {foodImage ? (
                          <Utensils size={25} />
                        ) : (
                          <ImageIcon size={25} />
                        )}
                        <span>
                          {foodImage ? "Food donation" : "Photo unavailable"}
                        </span>
                      </div>
                    </div>

                    <div className="ff-request-food-title">
                      <span className="ff-request-card-label">
                        FOOD DONATION
                      </span>
                      <h3>{foodName}</h3>
                    </div>

                    <span className={statusClass(status)}>
                      <span className="ff-request-status-dot" />
                      {status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="ff-request-details">
                    <div className="ff-request-detail">
                      <span className="ff-request-detail-icon">
                        <PackageCheck size={17} />
                      </span>
                      <span>
                        <small>Quantity requested</small>
                        <strong>{request.quantity}</strong>
                      </span>
                    </div>

                    {location && (
                      <div className="ff-request-detail">
                        <span className="ff-request-detail-icon">
                          <MapPin size={17} />
                        </span>
                        <span>
                          <small>Pickup location</small>
                          <strong>{location}</strong>
                        </span>
                      </div>
                    )}

                    {request.created_at && (
                      <div className="ff-request-detail">
                        <span className="ff-request-detail-icon">
                          <CalendarDays size={17} />
                        </span>
                        <span>
                          <small>Requested on</small>
                          <strong>{formatDate(request.created_at)}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="ff-request-card-footer">
                    <div className="ff-request-next-step">
                      <Clock3 size={16} />
                      <span>
                        {status === "REQUESTED" &&
                          "Waiting for donor approval"}
                        {status === "APPROVED" && "Ready for collection"}
                        {status === "PICKED_UP" &&
                          "Awaiting delivery confirmation"}
                        {status === "DELIVERED" &&
                          "Donation journey completed"}
                        {status === "REJECTED" &&
                          "Request was not approved"}
                        {![
                          "REQUESTED",
                          "APPROVED",
                          "PICKED_UP",
                          "DELIVERED",
                          "REJECTED",
                        ].includes(status) &&
                          "Check the latest request status"}
                      </span>
                    </div>

                    <div className="ff-request-actions">
                      {status === "APPROVED" && (
                        <button
                          type="button"
                          className="ff-request-action-button"
                          onClick={() => updateStatus(request.id, "pickup")}
                          disabled={busyId !== null}
                        >
                          <Truck size={17} />
                          {busyId === request.id
                            ? "Updating..."
                            : "Mark Picked Up"}
                        </button>
                      )}

                      {status === "PICKED_UP" && (
                        <button
                          type="button"
                          className="ff-request-action-button"
                          onClick={() => updateStatus(request.id, "delivered")}
                          disabled={busyId !== null}
                        >
                          <PackageCheck size={17} />
                          {busyId === request.id
                            ? "Updating..."
                            : "Mark Delivered"}
                        </button>
                      )}

                      {status === "DELIVERED" && (
                        <span className="ff-request-complete">
                          <CheckCircle2 size={18} /> Completed
                        </span>
                      )}

                      {status === "REJECTED" && (
                        <span className="ff-request-rejected">
                          Request rejected
                        </span>
                      )}

                      {status === "REQUESTED" && (
                        <span className="ff-request-pending">
                          Awaiting approval
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <footer className="ff-requests-footer">
          <span className="ff-requests-footer-leaf">
            <Leaf size={22} />
          </span>
          <p>Every meal shared is a little more hope delivered.</p>
          <span>FeedForward · Good Food. Better Impact.</span>
        </footer>
      </div>
    </main>
  );
}

function HeartIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </svg>
  );
}
