
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("feedforward_user") || "{}"
  );

  function logout() {
    localStorage.removeItem("feedforward_token");
    localStorage.removeItem("feedforward_user");
    navigate("/");
  }

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <h2>♻ FeedForward</h2>
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="welcome-section">
        <span className="eyebrow">GOOD FOOD. BETTER IMPACT.</span>
        <h1>Welcome, {user.name || "User"}!</h1>
        <p>
          Every donation is a step toward reducing food waste and helping
          people in need.
        </p>

        <div className="role-card">
          <span>Your account type</span>
          <h3>{user.role || "User"}</h3>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <span className="feature-icon">🥗</span>
          <h3>Donate Food</h3>
          <p>Share safe surplus food with people who need it.</p>
        </article>

        <article className="feature-card">
          <span className="feature-icon">🤝</span>
          <h3>Find Donations</h3>
          <p>Help recipient organizations discover available food.</p>
        </article>

        <article className="feature-card">
          <span className="feature-icon">🌍</span>
          <h3>Make an Impact</h3>
          <p>Turn surplus meals into community support.</p>
        </article>
      </section>
    </main>
  );
}
