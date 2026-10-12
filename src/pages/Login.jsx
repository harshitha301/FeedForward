import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

const donationImage =
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&q=90";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const data = response.data;
      const token = data.token || data.accessToken;
      const user = data.user || data;

      if (!token) {
        throw new Error("Login response did not include an authentication token.");
      }

      localStorage.setItem("feedforward_token", token);
      localStorage.setItem("feedforward_user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to sign in. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ff-login">
      {/* LEFT: DONATION STORY */}
      <section className="ff-login-hero">
        <header className="ff-brand-row">
          <Link to="/login" className="ff-brand" aria-label="FeedForward home">
            <span className="ff-logo-leaf" aria-hidden="true">
              ❧
            </span>
            <span className="ff-brand-name">
              Feed<span>Forward</span>
              <small>Good Food. Better Impact.</small>
            </span>
          </Link>

          <div className="ff-handwritten ff-top-note">
            Real Food
            <br />
            Real People
            <br />
            Real Change ♡
          </div>
        </header>

        <div className="ff-hero-content">
          <div className="ff-hero-label">
            <span className="ff-live-dot" />
            FOOD SHARED. HOPE SPREAD.
          </div>

          <h1>
            Let No Meal
            <br />
            Go to <span>Waste,</span>
            <br />
            Let No Heart
            <br />
            Go Hungry.
          </h1>

          <p className="ff-hero-description">
            We connect surplus food with people and communities who need it
            most. One small act of kindness can make a world of difference.
          </p>

          <div className="ff-hero-image">
            <img
              src={donationImage}
              alt="Food being shared to support people in the community"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <div className="ff-image-caption">
              <span className="ff-caption-icon">♥</span>
              <div>
                <strong>Food brings hope.</strong>
                <span>Share more. Waste less. Care more.</span>
              </div>
            </div>
          </div>

          <div className="ff-impact-row">
            <div className="ff-impact-item">
              <span className="ff-impact-icon">♧</span>
              <strong>Reduce</strong>
              <span>Food Waste</span>
            </div>

            <div className="ff-impact-item">
              <span className="ff-impact-icon">♟</span>
              <strong>Support</strong>
              <span>Communities</span>
            </div>

            <div className="ff-impact-item">
              <span className="ff-impact-icon">♥</span>
              <strong>Build a</strong>
              <span>Healthier Tomorrow</span>
            </div>
          </div>
        </div>

        <div className="ff-hero-bottom">
          <span className="ff-handwritten ff-bottom-note">
            Small actions.
            <br />
            Big impact. ♡
          </span>

          <div className="ff-impact-stats">
            <div>
              <span className="ff-stat-icon">♨</span>
              <p>
                <strong>Every</strong>
                <small>Meal Matters</small>
              </p>
            </div>
            <div>
              <span className="ff-stat-icon">♥</span>
              <p>
                <strong>Every</strong>
                <small>Act Counts</small>
              </p>
            </div>
            <div>
              <span className="ff-stat-icon">✦</span>
              <p>
                <strong>Every</strong>
                <small>Life Matters</small>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT: LOGIN FORM */}
      <section className="ff-login-panel">
        <div className="ff-botanical ff-botanical-top" aria-hidden="true">
          ❧
        </div>

        <div className="ff-login-card">
          <div className="ff-login-top">
            <span className="ff-welcome-badge">
              <span />
              Welcome Back
            </span>
            <span className="ff-card-heart" aria-hidden="true">
              ♡
            </span>
          </div>

          <div className="ff-form-wrap">
            <h2>Good to see you!</h2>
            <p className="ff-form-description">
              Sign in to continue making a difference.
            </p>

            <form className="ff-form" onSubmit={handleSubmit}>
              <div className="ff-field">
                <label htmlFor="ff-email">Email address</label>
                <div className="ff-input-wrap">
                  <span className="ff-input-icon" aria-hidden="true">
                    ✉
                  </span>
                  <input
                    id="ff-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="ff-field">
                <label htmlFor="ff-password">Password</label>
                <div className="ff-input-wrap">
                  <span className="ff-input-icon" aria-hidden="true">
                    ♙
                  </span>
                  <input
                    id="ff-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="ff-show-password"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="ff-login-error" role="alert">
                  <span>!</span>
                  {error}
                </div>
              )}

              <button className="ff-submit" type="submit" disabled={loading}>
                <span>
                  {loading ? "Signing you in..." : "Sign in to FeedForward"}
                </span>
                {!loading && <span className="ff-submit-arrow">→</span>}
                {loading && <span className="ff-spinner" />}
              </button>
            </form>

            <div className="ff-divider">
              <span />
              <span>NEW TO FEEDFORWARD?</span>
              <span />
            </div>

            <Link to="/signup" className="ff-create-account">
              Create your free account
              <span>→</span>
            </Link>

            <div className="ff-secure-note">
              <span className="ff-shield">⬟</span>
              <span>Secure</span>
              <i>•</i>
              <span>Trusted</span>
              <i>•</i>
              <span>Making an Impact</span>
            </div>
          </div>
        </div>

        <div className="ff-handwritten ff-panel-note">
          Together,
          <br />
          we can end
          <br />
          food waste ♡
        </div>

        <div className="ff-botanical ff-botanical-bottom" aria-hidden="true">
          ❧
        </div>
      </section>
    </main>
  );
}