
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Utensils,
  MapPin,
  Clock,
  Package,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Heart,
  Leaf,
  Sparkles,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import "./FoodDonations.css";

const initialForm = {
  foodName: "Vegetable Rice",
  foodType: "Cooked Food",
  quantity: "20",
  preparedTime: "",
  bestBefore: "",
  location: "",
  description: "",
};

const MAX_IMAGE_SIZE = 1024 * 1024;

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

function statusClass(status) {
  return String(status || "available")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
}

function FoodImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="ff-food-record-placeholder">
        <Utensils size={30} />
        <span>Food donation</span>
      </div>
    );
  }

  return (
    <img
      className="ff-food-record-photo"
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}

export default function FoodDonations() {
  const [form, setForm] = useState(initialForm);
  const [donations, setDonations] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);

  const loadDonations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/food/my-donations");
      setDonations(response.data.donations || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your donations. Please check your login and backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setImageError("");

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setImageError("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Please select an image smaller than 1 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedImage(reader.result);
      } else {
        setImageError("Could not read the selected image.");
      }
    };

    reader.onerror = () => {
      setImageError("Could not read the selected image. Try another photo.");
    };

    reader.readAsDataURL(file);
  }

  function removeImage() {
    setSelectedImage("");
    setImageError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setImageError("");

    const quantity = Number(form.quantity);
    const expiry = new Date(form.bestBefore);

    if (!form.foodName.trim() || !form.location.trim()) {
      setError("Enter the food name and pickup location.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (!form.bestBefore || Number.isNaN(expiry.getTime())) {
      setError("Please select a valid expiry date and time.");
      return;
    }

    if (expiry <= new Date()) {
      setError("Expiry date and time must be in the future.");
      return;
    }

    if (form.preparedTime) {
      const prepared = new Date(form.preparedTime);

      if (Number.isNaN(prepared.getTime()) || prepared > new Date()) {
        setError("Preparation time cannot be in the future.");
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        foodName: form.foodName.trim(),
        foodType: form.foodType,
        quantity,
        preparedTime: form.preparedTime
          ? new Date(form.preparedTime).toISOString()
          : "",
        bestBefore: expiry.toISOString(),
        location: form.location.trim(),
        description: form.description.trim(),
        image: selectedImage,
      };

      const response = await api.post("/food/donate", payload);

      setSuccess(
        response.data.message ||
          "Your food donation was created successfully!"
      );

      setForm(initialForm);
      removeImage();

      await loadDonations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit donation. Please check your login and backend server."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="ff-food-page">
      <header className="ff-food-nav">
        <Link to="/dashboard" className="ff-food-back">
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </Link>

        <Link to="/dashboard" className="ff-food-brand">
          <span className="ff-food-brand-icon">
            <Leaf size={24} />
          </span>
          <span>
            <strong>FeedForward</strong>
            <small>Good Food. Better Impact.</small>
          </span>
        </Link>

        <span className="ff-food-nav-note">
          <Heart size={16} /> Share kindness
        </span>
      </header>

      <section className="ff-food-hero">
        <div className="ff-food-hero-copy">
          <span className="ff-food-kicker">
            <Sparkles size={15} /> EVERY MEAL MATTERS
          </span>

          <h1>
            Share food.
            <br />
            <span>Spread hope.</span>
          </h1>

          <p>
            Turn surplus food into meaningful meals for orphanages,
            old-age homes and communities that need a helping hand.
          </p>

          <a href="#donation-form" className="ff-food-hero-button">
            Donate food <ArrowLeft size={17} className="ff-food-arrow" />
          </a>

          <div className="ff-food-trust-note">
            <CheckCircle size={16} />
            <span>Small acts. Meaningful impact.</span>
          </div>
        </div>

        <div className="ff-food-hero-image">
          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1100&q=85"
            alt="Fresh, nutritious food ready to be shared"
          />

          <div className="ff-food-image-note">
            <span className="ff-food-image-note-icon">
              <Heart size={19} />
            </span>
            <span>
              <strong>Good food deserves a second chance.</strong>
              <small>Donate today, make a difference.</small>
            </span>
          </div>
        </div>
      </section>

      <section className="ff-food-content">
        <div className="ff-food-section-heading">
          <div>
            <span className="ff-food-kicker">MAKE AN IMPACT</span>
            <h2>Donate surplus food</h2>
            <p>
              Share a few details so your donation can be collected safely.
            </p>
          </div>

          <div className="ff-food-heading-mark">
            <Utensils size={25} />
          </div>
        </div>

        {error && (
          <div className="ff-food-alert ff-food-error" role="alert">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="ff-food-alert ff-food-success" role="status">
            <CheckCircle size={19} />
            <span>{success}</span>
          </div>
        )}

        <div className="ff-food-layout">
          <section className="ff-food-form-card" id="donation-form">
            <div className="ff-food-card-title">
              <span className="ff-food-title-icon">
                <Package size={21} />
              </span>
              <div>
                <h3>Food details</h3>
                <p>Fields marked * are required.</p>
              </div>
            </div>

            <form
  noValidate
  onSubmit={handleSubmit}
  className="ff-food-form"
>
              <label>
                Food name *
                <input
                  name="foodName"
                  value={form.foodName}
                  onChange={handleChange}
                  placeholder="e.g. Vegetable Rice"
                  maxLength={100}
                  required
                />
              </label>

              <div className="ff-food-two-col">
                <label>
                  Food category *
                  <select
                    name="foodType"
                    value={form.foodType}
                    onChange={handleChange}
                    required
                  >
                    <option>Cooked Food</option>
                    <option>Packaged Food</option>
                    <option>Fruits and Vegetables</option>
                    <option>Bakery Items</option>
                    <option>Dairy Products</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Quantity *
                  <input
                    name="quantity"
                    type="number"
                    min="0.01"
                    step="any"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />
                  <small>
                    Specify units in additional details, e.g. 20 meals.
                  </small>
                </label>
              </div>

              <div className="ff-food-two-col">
                <label>
                  <span className="ff-food-label-icon">
                    <Clock size={15} /> Preparation time
                  </span>
                  <input
                    name="preparedTime"
                    type="datetime-local"
                    value={form.preparedTime}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  <span className="ff-food-label-icon">
                    <Clock size={15} /> Best before *
                  </span>
                  <input
                    name="bestBefore"
                    type="datetime-local"
                    value={form.bestBefore}
                    onChange={handleChange}
                    min={new Date(
                      Date.now() - new Date().getTimezoneOffset() * 60000
                    )
                      .toISOString()
                      .slice(0, 16)}
                    required
                  />
                </label>
              </div>

              <label>
                <span className="ff-food-label-icon">
                  <MapPin size={16} /> Pickup location *
                </span>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Full address, area, city"
                  maxLength={250}
                  required
                />
              </label>

              <div className="ff-food-upload">
                <label htmlFor="food-photo">
                  <span className="ff-food-label-icon">
                    <ImagePlus size={17} /> Food photo (optional)
                  </span>
                </label>

                <p className="ff-food-upload-help">
                  Select a clear photo of the food from your device.
                  JPG, PNG or WEBP, maximum 1 MB.
                </p>

                <input
                  ref={fileInputRef}
                  id="food-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />

                {imageError && (
                  <div className="ff-food-alert ff-food-error" role="alert">
                    <AlertCircle size={17} />
                    <span>{imageError}</span>
                  </div>
                )}

                {selectedImage && (
                  <div className="ff-food-photo-preview">
                    <img
                      src={selectedImage}
                      alt="Preview of selected food"
                    />

                    <div className="ff-food-photo-preview-info">
                      <CheckCircle size={17} />
                      <span>Photo ready to upload</span>
                    </div>

                    <button
                      type="button"
                      className="ff-food-remove-photo"
                      onClick={removeImage}
                    >
                      <Trash2 size={16} /> Remove photo
                    </button>
                  </div>
                )}
              </div>

              <label>
                Additional details
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Meal count, packaging, dietary details or collection instructions..."
                  rows={4}
                  maxLength={1000}
                />
              </label>

              <button
                type="submit"
                className="ff-food-submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw size={18} className="ff-food-spin" />
                    Publishing donation...
                  </>
                ) : (
                  <>
                    <Heart size={18} />
                    Publish food donation
                  </>
                )}
              </button>

              <p className="ff-food-form-note">
                Please donate only food that is safe to consume. Enter accurate
                preparation and expiry details.
              </p>
            </form>
          </section>

          <aside className="ff-food-sidebar">
            <div className="ff-food-impact-card">
              <span className="ff-food-impact-icon">
                <Heart size={25} />
              </span>
              <span className="ff-food-kicker">YOUR KINDNESS COUNTS</span>
              <h3>A little extra food can mean a lot.</h3>
              <p>
                Your surplus meal could help feed a child, support an older
                adult, or bring relief to a family.
              </p>
              <div className="ff-food-impact-divider" />
              <div className="ff-food-impact-bottom">
                <Leaf size={19} />
                <span>Reduce waste. Nourish lives.</span>
              </div>
            </div>

            <div className="ff-food-tips-card">
              <h3>
                <CheckCircle size={19} /> Before you donate
              </h3>
              <ul>
                <li>Provide a correct pickup address.</li>
                <li>Enter the actual expiry time.</li>
                <li>Use clean, food-safe packaging.</li>
                <li>Include helpful pickup instructions.</li>
              </ul>
            </div>
          </aside>
        </div>

        <section className="ff-food-my-donations">
          <div className="ff-food-section-heading ff-food-history-heading">
            <div>
              <span className="ff-food-kicker">YOUR CONTRIBUTION</span>
              <h2>My donations</h2>
              <p>Keep track of the food you have shared.</p>
            </div>

            <button
              type="button"
              className="ff-food-refresh"
              onClick={loadDonations}
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={loading ? "ff-food-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="ff-food-empty">
              <RefreshCw size={25} className="ff-food-spin" />
              <p>Loading your donations...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="ff-food-empty">
              <span className="ff-food-empty-icon">
                <Utensils size={26} />
              </span>
              <h3>Your donation journey starts here.</h3>
              <p>Publish your first food donation using the form above.</p>
              <a href="#donation-form">Create your first donation</a>
            </div>
          ) : (
            <div className="ff-food-record-grid">
              {donations.map((donation) => (
                <article className="ff-food-record" key={donation.id}>
                  <FoodImage
                    src={donation.image}
                    alt={donation.food_name || "Donated food"}
                  />

                  <div className="ff-food-record-top">
                    <span className="ff-food-record-icon">
                      <Utensils size={21} />
                    </span>
                    <span
                      className={`ff-food-status ff-status-${statusClass(
                        donation.status
                      )}`}
                    >
                      {donation.status || "AVAILABLE"}
                    </span>
                  </div>

                  <h3>{donation.food_name}</h3>
                  <p className="ff-food-record-type">{donation.food_type}</p>

                  <div className="ff-food-record-detail">
                    <Package size={16} />
                    <span>Quantity: {donation.quantity}</span>
                  </div>

                  <div className="ff-food-record-detail">
                    <MapPin size={16} />
                    <span>{donation.location}</span>
                  </div>

                  <div className="ff-food-record-detail">
                    <Clock size={16} />
                    <span>
                      Best before: {formatDate(donation.best_before)}
                    </span>
                  </div>

                  {donation.description && (
                    <p className="ff-food-record-description">
                      {donation.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <footer className="ff-food-footer">
        <span>
          <Leaf size={18} /> FeedForward
        </span>
        <span>Good Food. Better Impact.</span>
      </footer>
    </main>
  );
}
