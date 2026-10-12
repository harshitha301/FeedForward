
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
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

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
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
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card signup-card">
        <div className="brand-icon">♻</div>
        <h1>Join FeedForward</h1>
        <p className="muted">Turn surplus food into meaningful impact.</p>

        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <input
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Email address</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            name="password"
            type="password"
            minLength="6"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label>Account type</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="donor">Food Donor</option>
            <option value="organization">Recipient Organization</option>
          </select>

          {form.role === "organization" && (
            <>
              <label>Organization name</label>
              <input
                name="organizationName"
                placeholder="Orphanage / old-age home / NGO"
                value={form.organizationName}
                onChange={handleChange}
                required
              />

              <label>Organization type</label>
              <select
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
            </>
          )}

          <label>Phone number</label>
          <input
            name="phone"
            type="tel"
            placeholder="Your contact number"
            value={form.phone}
            onChange={handleChange}
          />

          <label>Location</label>
          <input
            name="location"
            placeholder="Area, city"
            value={form.location}
            onChange={handleChange}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button className="primary-button" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </section>
    </main>
  );
}
