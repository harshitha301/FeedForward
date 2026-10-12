
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "donor",
    phone: "",
    location: "",
    organizationName: "",
    organizationType: "ORPHANAGE",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = { ...form };

      if (form.role !== "organization") {
        delete payload.organizationName;
        delete payload.organizationType;
      }

      await api.post("/auth/signup", payload);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Account creation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ff-signup">
      <section className="ff-signup-hero">
        <Link to="/" className="ff-signup-brand">
          <span className="ff-signup-brand-mark">f</span>
          <span>
            Feed<span className="ff-brand-green">Forward</span>
          </span>
        </Link>

        <div className="ff-signup-hero-content">
          <div className="ff-signup-eyebrow">
            <span className="ff-signup-pulse" />
            FOOD RESCUE · COMMUNITY CARE · REAL IMPACT
          </div>

          <h1>
            Let No Meal Go to Waste,
            <br />
            <span>Let No Heart Go Hungry.</span>
          </h1>

          <p className="ff-signup-hero-description">
            Good food deserves another chance. Help connect surplus food
            from generous donors to orphanages, old-age homes, and
            communities that need it most.
          </p>

          <div className="ff-signup-photo">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1400&q=85"
              alt="Community volunteers helping people through food donations"
              onError={(event) => {
                event.currentTarget.src =
                  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1400&q=85";
              }}
            />

            <div className="ff-signup-photo-overlay" />

            <div className="ff-signup-photo-caption">
              <span className="ff-signup-heart">♥</span>
              <div>
                <strong>Every meal can make a difference.</strong>
                <span>Share food. Share hope. Change lives.</span>
              </div>
            </div>
          </div>

          <div className="ff-signup-values">
            <div className="ff-signup-value">
              <span className="ff-signup-value-icon">↗</span>
              <div>
                <strong>Rescue food</strong>
                <span>Reduce food waste</span>
              </div>
            </div>

            <div className="ff-signup-value">
              <span className="ff-signup-value-icon">♡</span>
              <div>
                <strong>Care for people</strong>
                <span>Support communities</span>
              </div>
            </div>

            <div className="ff-signup-value">
              <span className="ff-signup-value-icon">✳</span>
              <div>
                <strong>Create impact</strong>
                <span>Build a better tomorrow</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="ff-signup-hero-footer">
          <span className="ff-footer-leaf">✳</span>
          <span>SMALL ACTS OF KINDNESS. A BIGGER IMPACT.</span>
        </footer>
      </section>

      <section className="ff-signup-panel">
        <header className="ff-signup-top">
          <Link to="/" className="ff-signup-mobile-brand">
            <span className="ff-signup-brand-mark">f</span>
            <span>
              Feed<span className="ff-brand-green">Forward</span>
            </span>
          </Link>

          <span className="ff-signup-step">JOIN OUR COMMUNITY</span>
        </header>

        <div className="ff-signup-form-wrap">
          <div className="ff-signup-icon">✳</div>

          <span className="ff-signup-form-eyebrow">
            BE PART OF SOMETHING MEANINGFUL
          </span>

          <h2>Let's get started.</h2>

          <p className="ff-signup-description">
            Create your account and help good food reach the people who
            need it.
          </p>

          <form
            onSubmit={handleSubmit}
            className="ff-signup-form"
            noValidate={false}
          >
            <div className="ff-signup-field">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                name="name"
                autoComplete="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ff-signup-field">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ff-signup-field">
              <label htmlFor="signup-password">Password</label>

              <div className="ff-signup-password">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="ff-signup-show"
                  onClick={() => setShowPassword((previous) => !previous)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <span className="ff-signup-hint">
                Use at least 6 characters.
              </span>
            </div>

            <div className="ff-signup-field">
              <label htmlFor="signup-role">I want to join as a</label>

              <select
                id="signup-role"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="donor">Food Donor</option>
                <option value="organization">Recipient Organization</option>
              </select>
            </div>

            {form.role === "organization" && (
              <div className="ff-signup-org-section">
                <div className="ff-signup-org-heading">
                  <span className="ff-signup-org-symbol">⌂</span>
                  <div>
                    <strong>Organization details</strong>
                    <span>Help us understand your organization.</span>
                  </div>
                </div>

                <div className="ff-signup-field">
                  <label htmlFor="signup-org-name">
                    Organization name
                  </label>
                  <input
                    id="signup-org-name"
                    name="organizationName"
                    placeholder="Name of your organization"
                    value={form.organizationName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="ff-signup-field">
                  <label htmlFor="signup-org-type">
                    Organization type
                  </label>
                  <select
                    id="signup-org-type"
                    name="organizationType"
                    value={form.organizationType}
                    onChange={handleChange}
                  >
                    <option value="ORPHANAGE">Orphanage</option>
                    <option value="OLD_AGE_HOME">Old-age home</option>
                    <option value="NGO">NGO</option>
                    <option value="SHELTER">Shelter</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            )}

            <div className="ff-signup-two-col">
              <div className="ff-signup-field">
                <label htmlFor="signup-phone">Phone number</label>
                <input
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Contact number"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="ff-signup-field">
                <label htmlFor="signup-location">Location</label>
                <input
                  id="signup-location"
                  name="location"
                  autoComplete="address-level2"
                  placeholder="Area, city"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="ff-signup-error" role="alert">
                <span>!</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="ff-signup-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="ff-signup-spinner" />
                  Creating your account...
                </>
              ) : (
                <>
                  Create my account <span>→</span>
                </>
              )}
            </button>

            <p className="ff-signup-terms">
              By creating an account, you agree to use FeedForward
              responsibly and provide accurate information.
            </p>
          </form>

          <div className="ff-signup-login">
            Already have an account?
            <Link to="/">Sign in →</Link>
          </div>
        </div>

        <footer className="ff-signup-footer">
          <span>© 2026 FeedForward</span>
          <span>Good Food. Better Impact.</span>
        </footer>
      </section>
    </main>
  );
}
