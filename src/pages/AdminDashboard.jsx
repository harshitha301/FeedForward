
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  Building2,
  Utensils,
  HeartHandshake,
  CheckCircle,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  AlertCircle,
  LayoutDashboard,
  LogOut,
  Leaf,
  ArrowUpRight,
  Clock3,
  Menu,
  X,
} from "lucide-react";
import api from "../services/api.js";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalDonations: 0,
    totalMeals: 0,
    delivered: 0,
  });
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [verifyingId, setVerifyingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [statsResponse, usersResponse, organizationsResponse] =
        await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users"),
          api.get("/admin/organizations"),
        ]);

      setStats(statsResponse.data.stats || {});
      setUsers(usersResponse.data.users || []);
      setOrganizations(
        organizationsResponse.data.organizations || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data. Check your admin login and backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function logout() {
    localStorage.removeItem("feedforward_token");
    localStorage.removeItem("feedforward_user");
    navigate("/");
  }

  async function verifyOrganization(organization) {
    setError("");
    setMessage("");
    setVerifyingId(organization.id);

    try {
      const response = await api.put(
        `/admin/organizations/${organization.id}/verify`
      );

      setMessage(
        response.data.message ||
          "Organization verified successfully."
      );

      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to verify this organization."
      );
    } finally {
      setVerifyingId(null);
    }
  }

  function organizationName(organization) {
    return (
      organization.organization_name ||
      organization.name ||
      organization.org_name ||
      `Organization #${organization.id}`
    );
  }

  function isVerified(organization) {
    return (
      organization.verified === 1 ||
      organization.verified === true ||
      organization.verified === "1"
    );
  }

  function formatDate(date) {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const pendingCount = organizations.filter(
    (organization) => !isVerified(organization)
  ).length;

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers ?? 0,
      icon: Users,
      color: "blue",
      note: "Registered accounts",
    },
    {
      label: "Organizations",
      value: stats.totalOrganizations ?? 0,
      icon: Building2,
      color: "purple",
      note: "Community partners",
    },
    {
      label: "Food Donations",
      value: stats.totalDonations ?? 0,
      icon: Utensils,
      color: "orange",
      note: "Donations recorded",
    },
    {
      label: "Meals Handled",
      value: stats.totalMeals ?? 0,
      icon: HeartHandshake,
      color: "green",
      note: "Meals represented by backend data",
    },
    {
      label: "Delivered Donations",
      value: stats.delivered ?? 0,
      icon: CheckCircle,
      color: "teal",
      note: "Successfully delivered",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const term = search.toLowerCase();

    return (
      String(user.name || "").toLowerCase().includes(term) ||
      String(user.email || "").toLowerCase().includes(term) ||
      String(user.role || "").toLowerCase().includes(term)
    );
  });

  return (
    <main className="ff-admin">
      <aside
        className={`ff-sidebar ${sidebarOpen ? "ff-sidebar-open" : ""}`}
      >
        <div className="ff-brand">
          <div className="ff-brand-mark">
            <Leaf size={25} />
          </div>
          <div>
            <strong>FeedForward</strong>
            <span>Good Food. Better Impact.</span>
          </div>
          <button
            className="ff-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="ff-sidebar-label">WORKSPACE</div>

        <nav className="ff-nav">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => {
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
          >
            <LayoutDashboard size={19} />
            <span>Overview</span>
          </button>

          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => {
              setActiveTab("users");
              setSidebarOpen(false);
            }}
          >
            <Users size={19} />
            <span>Registered Users</span>
            <span className="ff-nav-count">{users.length}</span>
          </button>

          <button
            className={
              activeTab === "organizations" ? "active" : ""
            }
            onClick={() => {
              setActiveTab("organizations");
              setSidebarOpen(false);
            }}
          >
            <Building2 size={19} />
            <span>Organizations</span>
            <span className="ff-nav-count">
              {pendingCount}
            </span>
          </button>
        </nav>

        <div className="ff-sidebar-bottom">
          <div className="ff-sidebar-impact">
            <div className="ff-impact-icon">
              <HeartHandshake size={23} />
            </div>
            <strong>Every meal matters.</strong>
            <p>
              Helping good food reach the people who need it.
            </p>
          </div>

          <button className="ff-logout" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="ff-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <section className="ff-main">
        <header className="ff-topbar">
          <div className="ff-topbar-left">
            <button
              className="ff-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <span className="ff-breadcrumb">
                FeedForward <span>/</span> Administration
              </span>
              <h2>
                {activeTab === "overview"
                  ? "Dashboard overview"
                  : activeTab === "users"
                    ? "Registered users"
                    : "Organization management"}
              </h2>
            </div>
          </div>

          <div className="ff-topbar-actions">
            <div className="ff-admin-profile">
              <div className="ff-admin-avatar">
                <ShieldCheck size={21} />
              </div>
              <div>
                <strong>Administrator</strong>
                <span>Super Admin</span>
              </div>
            </div>

            <button
              className="ff-refresh"
              onClick={loadDashboard}
              disabled={loading}
              title="Refresh dashboard data"
            >
              <RefreshCw
                size={17}
                className={loading ? "ff-spin" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <div className="ff-content">
          {activeTab === "overview" && (
            <section className="ff-hero">
              <div className="ff-hero-copy">
                <span className="ff-hero-eyebrow">
                  <span className="ff-live-dot" />
                  YOUR COMMUNITY AT A GLANCE
                </span>
                <h1>
                  Small actions.
                  <br />
                  <span>Big impact.</span>
                </h1>
                <p>
                  Manage food donations, support community
                  organizations, and help reduce food waste
                  from one place.
                </p>

                <button
                  className="ff-hero-button"
                  onClick={() => setActiveTab("organizations")}
                >
                  Review organizations
                  <ArrowUpRight size={18} />
                </button>
              </div>

              <div className="ff-hero-art">
                <div className="ff-hero-circle ff-circle-one" />
                <div className="ff-hero-circle ff-circle-two" />
                <div className="ff-hero-illustration">
                  <HeartHandshake size={76} strokeWidth={1.4} />
                  <Leaf className="ff-floating-leaf" size={34} />
                </div>
                <div className="ff-hero-note">
                  <CheckCircle size={19} />
                  <span>
                    <strong>Good food,</strong>
                    <small>better futures</small>
                  </span>
                </div>
              </div>
            </section>
          )}

          {error && (
            <div className="ff-alert ff-alert-error" role="alert">
              <AlertCircle size={19} />
              <span>{error}</span>
              <button onClick={() => setError("")}>Dismiss</button>
            </div>
          )}

          {message && (
            <div className="ff-alert ff-alert-success" role="status">
              <CheckCircle size={19} />
              <span>{message}</span>
              <button onClick={() => setMessage("")}>Dismiss</button>
            </div>
          )}

          {activeTab === "overview" && (
            <>
              <div className="ff-section-heading">
                <div>
                  <span className="ff-section-kicker">
                    PLATFORM PERFORMANCE
                  </span>
                  <h2>Impact at a glance</h2>
                  <p>Live figures retrieved from your backend.</p>
                </div>
                <span className="ff-data-label">
                  <span className="ff-live-dot" />
                  Connected data
                </span>
              </div>

              {loading ? (
                <div className="ff-loading">
                  <RefreshCw size={25} className="ff-spin" />
                  <p>Loading your dashboard...</p>
                </div>
              ) : (
                <div className="ff-stat-grid">
                  {statCards.map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <article
                        className="ff-stat-card"
                        key={stat.label}
                      >
                        <div className="ff-stat-top">
                          <div className={`ff-stat-icon ${stat.color}`}>
                            <Icon size={22} />
                          </div>
                          <span className="ff-stat-decoration">
                            <ArrowUpRight size={17} />
                          </span>
                        </div>
                        <p>{stat.label}</p>
                        <h3>
                          {Number(stat.value).toLocaleString("en-IN")}
                        </h3>
                        <span className="ff-stat-note">
                          {stat.note}
                        </span>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="ff-overview-grid">
                <article className="ff-panel">
                  <div className="ff-panel-heading">
                    <div>
                      <span className="ff-section-kicker">
                        COMMUNITY
                      </span>
                      <h2>Recently registered users</h2>
                      <p>Latest accounts on FeedForward.</p>
                    </div>
                    <button
                      className="ff-link-button"
                      onClick={() => setActiveTab("users")}
                    >
                      View all <ArrowUpRight size={16} />
                    </button>
                  </div>

                  {loading ? (
                    <p className="ff-empty">Loading users...</p>
                  ) : users.length === 0 ? (
                    <p className="ff-empty">
                      No registered users found yet.
                    </p>
                  ) : (
                    <div className="ff-table-wrap">
                      <table className="ff-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.slice(0, 5).map((user) => (
                            <tr key={user.id}>
                              <td>
                                <div className="ff-user-cell">
                                  <span className="ff-user-avatar">
                                    {String(user.name || "U")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                  <strong>
                                    {user.name || "Unnamed user"}
                                  </strong>
                                </div>
                              </td>
                              <td>
                                <span
                                  className={`ff-role-badge ${String(
                                    user.role || ""
                                  ).toLowerCase()}`}
                                >
                                  {user.role || "Unknown"}
                                </span>
                              </td>
                              <td>{formatDate(user.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </article>

                <article className="ff-panel ff-verification-panel">
                  <div className="ff-panel-heading">
                    <div>
                      <span className="ff-section-kicker">
                        TRUST & SAFETY
                      </span>
                      <h2>Organization verification</h2>
                      <p>Help keep the community trustworthy.</p>
                    </div>
                    <div className="ff-panel-icon">
                      <ShieldCheck size={23} />
                    </div>
                  </div>

                  <div className="ff-verification-total">
                    <span>Registered organizations</span>
                    <strong>{organizations.length}</strong>
                  </div>
                  <div className="ff-verification-row">
                    <span>
                      <CheckCircle size={17} />
                      Verified
                    </span>
                    <strong className="ff-verified-number">
                      {organizations.filter(isVerified).length}
                    </strong>
                  </div>
                  <div className="ff-verification-row">
                    <span>
                      <Clock3 size={17} />
                      Pending review
                    </span>
                    <strong className="ff-pending-number">
                      {pendingCount}
                    </strong>
                  </div>

                  <button
                    className="ff-review-button"
                    onClick={() => setActiveTab("organizations")}
                  >
                    Manage organizations
                    <ArrowUpRight size={17} />
                  </button>
                </article>
              </div>

              <div className="ff-impact-banner">
                <div className="ff-impact-banner-icon">
                  <HeartHandshake size={28} />
                </div>
                <div>
                  <h3>Good food deserves a second chance.</h3>
                  <p>
                    Every safe donation shared with a community
                    organization is a step toward reducing food waste.
                  </p>
                </div>
                <Leaf size={43} className="ff-banner-leaf" />
              </div>
            </>
          )}

          {activeTab === "users" && (
            <section className="ff-panel ff-full-panel">
              <div className="ff-panel-heading ff-users-heading">
                <div>
                  <span className="ff-section-kicker">
                    COMMUNITY DIRECTORY
                  </span>
                  <h2>Registered users</h2>
                  <p>View user profiles and registration details.</p>
                </div>
                <span className="ff-total-pill">
                  {users.length} total users
                </span>
              </div>

              <div className="ff-search-box">
                <Users size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, email, or role..."
                  aria-label="Search users"
                />
              </div>

              {loading ? (
                <div className="ff-loading">
                  <RefreshCw size={25} className="ff-spin" />
                  <p>Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="ff-empty">No matching users found.</p>
              ) : (
                <div className="ff-table-wrap">
                  <table className="ff-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="ff-user-cell">
                              <span className="ff-user-avatar">
                                {String(user.name || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                              <div>
                                <strong>
                                  {user.name || "Unnamed user"}
                                </strong>
                                <small>ID: {user.id}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="ff-inline-detail">
                              <Mail size={15} />
                              {user.email || "Not provided"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`ff-role-badge ${String(
                                user.role || ""
                              ).toLowerCase()}`}
                            >
                              {user.role || "Unknown"}
                            </span>
                          </td>
                          <td>
                            {user.phone ? (
                              <span className="ff-inline-detail">
                                <Phone size={15} />
                                {user.phone}
                              </span>
                            ) : "—"}
                          </td>
                          <td>
                            {user.location ? (
                              <span className="ff-inline-detail">
                                <MapPin size={15} />
                                {user.location}
                              </span>
                            ) : "—"}
                          </td>
                          <td>
                            <span className="ff-inline-detail">
                              <CalendarDays size={15} />
                              {formatDate(user.created_at)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === "organizations" && (
            <section className="ff-organizations-section">
              <div className="ff-section-heading">
                <div>
                  <span className="ff-section-kicker">
                    TRUST & SAFETY
                  </span>
                  <h2>Organization management</h2>
                  <p>
                    Review organization accounts and verify eligible
                    community partners.
                  </p>
                </div>
                <span className="ff-total-pill">
                  {organizations.length} organizations
                </span>
              </div>

              <div className="ff-org-summary">
                <div>
                  <span>Total organizations</span>
                  <strong>{organizations.length}</strong>
                </div>
                <div>
                  <span>Verified</span>
                  <strong className="ff-verified-number">
                    {organizations.filter(isVerified).length}
                  </strong>
                </div>
                <div>
                  <span>Awaiting review</span>
                  <strong className="ff-pending-number">
                    {pendingCount}
                  </strong>
                </div>
              </div>

              {loading ? (
                <div className="ff-loading">
                  <RefreshCw size={25} className="ff-spin" />
                  <p>Loading organizations...</p>
                </div>
              ) : organizations.length === 0 ? (
                <div className="ff-panel ff-empty-state">
                  <Building2 size={40} />
                  <h3>No organizations registered</h3>
                  <p>
                    Registered organizations will appear here.
                  </p>
                </div>
              ) : (
                <div className="ff-org-grid">
                  {organizations.map((organization) => {
                    const verified = isVerified(organization);

                    return (
                      <article
                        className="ff-org-card"
                        key={organization.id}
                      >
                        <div className="ff-org-card-top">
                          <div className="ff-org-icon">
                            <Building2 size={25} />
                          </div>
                          <span
                            className={`ff-status ${
                              verified ? "verified" : "pending"
                            }`}
                          >
                            {verified ? (
                              <CheckCircle size={15} />
                            ) : (
                              <Clock3 size={15} />
                            )}
                            {verified ? "Verified" : "Pending"}
                          </span>
                        </div>

                        <h3>{organizationName(organization)}</h3>
                        <p className="ff-org-id">
                          Organization ID: {organization.id}
                        </p>

                        {(organization.type ||
                          organization.organization_type) && (
                          <p className="ff-org-detail">
                            <Building2 size={16} />
                            {organization.type ||
                              organization.organization_type}
                          </p>
                        )}

                        {organization.address && (
                          <p className="ff-org-detail">
                            <MapPin size={16} />
                            {organization.address}
                          </p>
                        )}

                        {organization.phone && (
                          <p className="ff-org-detail">
                            <Phone size={16} />
                            {organization.phone}
                          </p>
                        )}

                        {!verified ? (
                          <button
                            className="ff-verify-button"
                            disabled={verifyingId !== null}
                            onClick={() =>
                              verifyOrganization(organization)
                            }
                          >
                            {verifyingId === organization.id ? (
                              <RefreshCw
                                size={17}
                                className="ff-spin"
                              />
                            ) : (
                              <ShieldCheck size={17} />
                            )}
                            {verifyingId === organization.id
                              ? "Verifying..."
                              : "Verify organization"}
                          </button>
                        ) : (
                          <div className="ff-verified-message">
                            <CheckCircle size={17} />
                            This organization is verified
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          <footer className="ff-footer">
            <span>
              <Leaf size={16} /> FeedForward
            </span>
            <span>Good Food. Better Impact.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
