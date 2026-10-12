
import { useNavigate, Link } from "react-router-dom";
import {
  Leaf,
  Heart,
  Users,
  ShieldCheck,
  ArrowRight,
  Utensils,
  HandHeart,
  PackageCheck,
  MapPin,
  LogOut,
  Sparkles,
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("feedforward_user") || "{}");
  } catch {
    user = {};
  }

  const role = String(user.role || "user").toLowerCase();
  const isDonor = role === "donor";
  const isOrganization = role === "organization";
  const isAdmin = role === "admin";

  function logout() {
    localStorage.removeItem("feedforward_token");
    localStorage.removeItem("feedforward_user");
    navigate("/");
  }

  const actions = isDonor
    ? [
        {
          icon: Leaf,
          title: "Donate surplus food",
          description:
            "Share fresh, safe surplus food with organizations that need it.",
          link: "/donations",
          label: "Manage donations",
          tone: "green",
        },
        {
          icon: Heart,
          title: "Food requests",
          description:
            "Review requests from recipient organizations and respond to them.",
          link: "/donor-requests",
          label: "View requests",
          tone: "peach",
        },
      ]
    : isOrganization
      ? [
          {
            icon: Utensils,
            title: "Discover available food",
            description:
              "Browse food donations and find suitable supplies for your community.",
            link: "/available-food",
            label: "Explore food",
            tone: "green",
          },
          {
            icon: PackageCheck,
            title: "My food requests",
            description:
              "Keep track of your requests and their collection status.",
            link: "/my-requests",
            label: "Track requests",
            tone: "peach",
          },
        ]
      : isAdmin
        ? [
            {
              icon: ShieldCheck,
              title: "Administration",
              description:
                "Manage platform users, organizations, and verification activities.",
              link: "/admin",
              label: "Open admin panel",
              tone: "green",
            },
          ]
        : [];

  return (
    <main className="ff-dashboard">
      <header className="ff-dash-nav">
        <Link to="/dashboard" className="ff-dash-brand">
          <span className="ff-dash-brand-icon">
            <Leaf size={22} />
          </span>
          <span>
            FeedForward<span className="ff-dash-brand-dot">.</span>
            <small>GOOD FOOD. BETTER IMPACT.</small>
          </span>
        </Link>

        <div className="ff-dash-nav-right">
          <span className="ff-dash-online">
            <span /> You're making a difference
          </span>
          <button className="ff-dash-logout" onClick={logout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="ff-dash-content">
        <section className="ff-dash-hero">
          <div className="ff-dash-hero-copy">
            <span className="ff-dash-eyebrow">
              <Sparkles size={14} />
              YOUR IMPACT STARTS HERE
            </span>

            <h1>
              Hello, {user.name?.trim()?.split(" ")[0] || "there"}!
              <br />
              <span>Let's make good things happen.</span>
            </h1>

            <p>
              Every meal shared is an opportunity to reduce waste, support
              communities, and create a better tomorrow.
            </p>

            <div className="ff-dash-role">
              <span className="ff-dash-role-icon">
                {isDonor ? (
                  <Leaf size={18} />
                ) : isOrganization ? (
                  <HandHeart size={18} />
                ) : (
                  <ShieldCheck size={18} />
                )}
              </span>
              <span>
                <small>YOU'RE SIGNED IN AS</small>
                <strong>
                  {isDonor
                    ? "Food Donor"
                    : isOrganization
                      ? "Recipient Organization"
                      : isAdmin
                        ? "Administrator"
                        : "FeedForward Member"}
                </strong>
              </span>
            </div>
          </div>

          <div className="ff-dash-hero-visual">
            <div className="ff-dash-image-frame">
              <img
                src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85"
                alt="Fresh, colorful food ready to be shared"
              />
            </div>
            <div className="ff-dash-floating-note">
              <span className="ff-dash-floating-icon">
                <Heart size={19} fill="currentColor" />
              </span>
              <span>
                <strong>Share goodness</strong>
                <small>One action at a time.</small>
              </span>
            </div>
            <span className="ff-dash-deco ff-dash-deco-one">✳</span>
            <span className="ff-dash-deco ff-dash-deco-two">✳</span>
          </div>
        </section>

        <section className="ff-dash-section-heading">
          <div>
            <span className="ff-dash-section-kicker">YOUR WORKSPACE</span>
            <h2>What would you like to do?</h2>
            <p>Everything you need to make food sharing easier.</p>
          </div>
          <span className="ff-dash-section-mark">
            <Leaf size={21} />
          </span>
        </section>

        <section className="ff-dash-action-grid">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <article
                className={`ff-dash-action-card ff-dash-${action.tone}`}
                key={action.title}
              >
                <div className="ff-dash-card-top">
                  <span className="ff-dash-action-icon">
                    <Icon size={25} strokeWidth={1.8} />
                  </span>
                  <span className="ff-dash-card-arrow">
                    <ArrowRight size={19} />
                  </span>
                </div>

                <h3>{action.title}</h3>
                <p>{action.description}</p>

                <Link to={action.link} className="ff-dash-action-link">
                  {action.label}
                  <ArrowRight size={16} />
                </Link>
              </article>
            );
          })}

          {!isAdmin && (
            <article className="ff-dash-action-card ff-dash-neutral">
              <div className="ff-dash-card-top">
                <span className="ff-dash-action-icon">
                  <Users size={25} strokeWidth={1.8} />
                </span>
                <span className="ff-dash-card-arrow">
                  <Heart size={18} />
                </span>
              </div>

              <h3>Make a difference</h3>
              <p>
                Your contribution helps build a more thoughtful food-sharing
                community.
              </p>

              <div className="ff-dash-community-label">
                <span><MapPin size={15} /></span>
                Together, we can do more.
              </div>
            </article>
          )}
        </section>

        <section className="ff-dash-impact">
          <div className="ff-dash-impact-icon">
            <HandHeart size={27} />
          </div>
          <div className="ff-dash-impact-copy">
            <span>OUR SHARED MISSION</span>
            <h2>Good food belongs on plates, not in bins.</h2>
            <p>
              Small acts of food sharing can create meaningful change.
              Thank you for being part of the FeedForward community.
            </p>
          </div>
          <div className="ff-dash-impact-decoration">✳</div>
        </section>

        <footer className="ff-dash-footer">
          <Link to="/dashboard" className="ff-dash-footer-brand">
            <Leaf size={16} /> FeedForward
          </Link>
          <span>Good Food. Better Impact. © 2026</span>
        </footer>
      </div>
    </main>
  );
}
