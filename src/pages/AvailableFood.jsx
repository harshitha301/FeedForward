
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Utensils,
  RefreshCw,
  Send,
  Clock,
  Leaf,
  Heart,
  Package,
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";
import "./AvailableFood.css";

export default function AvailableFood() {
  const [foods, setFoods] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("feedforward_user") || "{}");
  } catch {
    user = {};
  }

  async function loadFoods() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/food/available");
      const donations = response.data.donations || [];
      setFoods(donations);

      setQuantities((previous) => {
        const next = { ...previous };
        donations.forEach((food) => {
          if (next[food.id] === undefined) next[food.id] = 1;
        });
        return next;
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load available food. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFoods();
  }, []);

  async function requestFood(food) {
    const quantity = Number(quantities[food.id]);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Please enter a valid whole-number quantity.");
      return;
    }

    if (quantity > Number(food.quantity)) {
      setError("Requested quantity cannot exceed the available quantity.");
      return;
    }

    setError("");
    setMessage("");
    setSubmitting(food.id);

    try {
      await api.post("/requests/create", {
        foodId: food.id,
        quantity,
      });

      setMessage(
        `Your request for ${food.food_name || food.foodName || "food"} was submitted successfully.`
      );
      await loadFoods();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit your request. Please try again."
      );
    } finally {
      setSubmitting(null);
    }
  }

  const categories = [
    "All",
    ...new Set(
      foods.map((food) => food.food_type || food.foodType || "Other")
    ),
  ];

  const filteredFoods = foods.filter((food) => {
    const name = food.food_name || food.foodName || "Food donation";
    const type = food.food_type || food.foodType || "Other";
    const location = food.location || "";

    const matchesSearch = `${name} ${type} ${location}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesSearch && (category === "All" || type === category);
  });

  return (
    <main className="ff-available-page">
      <header className="ff-available-nav">
        <Link to="/dashboard" className="ff-available-back">
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </Link>

        <Link to="/dashboard" className="ff-available-brand">
          <span className="ff-available-brand-icon">
            <Leaf size={23} />
          </span>
          <span>
            <strong>FeedForward</strong>
            <small>Good Food. Better Impact.</small>
          </span>
        </Link>

        <span className="ff-available-nav-note">
          <Heart size={16} /> Food with purpose
        </span>
      </header>

      <section className="ff-available-hero">
        <div className="ff-available-hero-copy">
          <span className="ff-available-eyebrow">
            <Sparkles size={15} /> FOOD FINDS A NEW HOME
          </span>
          <h1>Good food.<br /><span>Greater good.</span></h1>
          <p>
            Discover surplus food shared by generous donors.
            Find what your organization needs and turn extra meals
            into meaningful support for your community.
          </p>

          <div className="ff-available-hero-stats">
            <div>
              <strong>{foods.length}</strong>
              <span>Food listings</span>
            </div>
            <div className="ff-available-stat-divider" />
            <div>
              <span>One shared</span>
              <strong>Mission</strong>
            </div>
          </div>
        </div>

        <div className="ff-available-hero-visual">
          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85"
            alt="A fresh, nutritious meal"
          />
          <div className="ff-available-floating-note">
            <span><Heart size={20} /></span>
            <div>
              <strong>Every meal matters</strong>
              <small>Less waste, more care.</small>
            </div>
          </div>
        </div>
      </section>

      <section className="ff-available-content">
        {user.role !== "organization" && (
          <div className="ff-available-notice">
            <AlertCircle size={19} />
            <span>
              You can browse available donations, but only an organization
              account can request food.
            </span>
          </div>
        )}

        {error && (
          <div className="ff-available-alert ff-available-error" role="alert">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="ff-available-alert ff-available-success" role="status">
            <CheckCircle size={19} />
            <span>{message}</span>
          </div>
        )}

        <div className="ff-available-section-heading">
          <div>
            <span className="ff-available-eyebrow">DISCOVER DONATIONS</span>
            <h2>Food available near you</h2>
            <p>Explore donations and request the quantity your organization needs.</p>
          </div>

          <button
            type="button"
            className="ff-available-refresh"
            onClick={loadFoods}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "ff-available-spin" : ""} />
            Refresh listings
          </button>
        </div>

        <div className="ff-available-toolbar">
          <label className="ff-available-search">
            <Search size={19} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search food, category or location..."
              aria-label="Search food donations"
            />
          </label>

          <label className="ff-available-category">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="ff-available-results-line">
          <span>
            <Utensils size={17} />
            <strong>{filteredFoods.length}</strong>
            {filteredFoods.length === 1 ? " donation found" : " donations found"}
          </span>
          {(search || category !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="ff-available-empty">
            <RefreshCw size={29} className="ff-available-spin" />
            <h3>Finding available food...</h3>
            <p>Please wait while we load the latest donations.</p>
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="ff-available-empty">
            <span className="ff-available-empty-icon">
              {foods.length === 0 ? <Utensils size={29} /> : <Search size={29} />}
            </span>
            <h3>
              {foods.length === 0
                ? "No food donations available yet"
                : "No matching donations found"}
            </h3>
            <p>
              {foods.length === 0
                ? "Please check again later. New donations may arrive soon."
                : "Try a different search term or choose another category."}
            </p>
            {foods.length > 0 && (
              <button
                type="button"
                className="ff-available-reset"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Show all donations
              </button>
            )}
          </div>
        ) : (
          <section className="ff-available-grid">
            {filteredFoods.map((food) => {
              const name = food.food_name || food.foodName || "Food donation";
              const type = food.food_type || food.foodType || "Other";
              const location = food.location || "Location not provided";
              const bestBefore = food.best_before || food.bestBefore;

              return (
                <article className="ff-available-card" key={food.id}>
                  <div className="ff-available-card-visual">
                    {food.image ? (
                      <img src={food.image} alt={name} />
                    ) : (
                      <div className="ff-available-placeholder">
                        <Utensils size={39} />
                        <span>Shared with care</span>
                      </div>
                    )}
                    <span className="ff-available-type">{type}</span>
                  </div>

                  <div className="ff-available-card-body">
                    <div className="ff-available-card-title">
                      <h3>{name}</h3>
                      <span className="ff-available-food-mark">
                        <Leaf size={17} />
                      </span>
                    </div>

                    <div className="ff-available-quantity">
                      <span className="ff-available-quantity-icon">
                        <Package size={18} />
                      </span>
                      <span>
                        <small>Available quantity</small>
                        <strong>{food.quantity}</strong>
                      </span>
                    </div>

                    <div className="ff-available-detail">
                      <MapPin size={16} />
                      <span>{location}</span>
                    </div>

                    {bestBefore && (
                      <div className="ff-available-detail">
                        <Clock size={16} />
                        <span>
                          Best before: {String(bestBefore).replace("T", " ").slice(0, 16)}
                        </span>
                      </div>
                    )}

                    {food.description && (
                      <p className="ff-available-description">{food.description}</p>
                    )}

                    {user.role === "organization" && (
                      <div className="ff-available-request">
                        <label htmlFor={`quantity-${food.id}`}>
                          Quantity to request
                        </label>
                        <input
                          id={`quantity-${food.id}`}
                          type="number"
                          min="1"
                          max={food.quantity}
                          step="1"
                          value={quantities[food.id] ?? 1}
                          onChange={(event) =>
                            setQuantities((previous) => ({
                              ...previous,
                              [food.id]: event.target.value,
                            }))
                          }
                        />

                        <button
                          type="button"
                          className="ff-available-request-button"
                          onClick={() => requestFood(food)}
                          disabled={submitting !== null}
                        >
                          {submitting === food.id ? (
                            <><RefreshCw size={17} className="ff-available-spin" /> Submitting...</>
                          ) : (
                            <><Send size={17} /> Request food</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <div className="ff-available-bottom-note">
          <Heart size={19} />
          <p><strong>Good food should never go to waste.</strong> Thank you for helping nourish your community.</p>
        </div>
      </section>

      <footer className="ff-available-footer">
        <span><Leaf size={18} /> FeedForward</span>
        <span>Good Food. Better Impact.</span>
      </footer>
    </main>
  );
}
