import { Link, NavLink } from "react-router-dom";
import { VOCAB } from "@utils/vocabulary";
import "./NavBar.css";

/**
 * Gold-accent, glassy navbar to match the landing page.
 * - Brand at left with subtle gold crest dot + wordmark
 * - Links on the right; active link gets a soft gold glow
 * - Logout clears sl_user and returns to "/"
 */
export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/streamlist" className="brand" aria-label="StreamList Home">
        <span className="brand-crest" aria-hidden="true">
          {/* small spinning gear icon */}
          <svg className="gear-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="currentColor" d="M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Zm9.16 3.04l-1.73-.29a7.99 7.99 0 0 0-.6-1.46l1.03-1.42a.75.75 0 0 0-.1-.98l-1.35-1.35a.75.75 0 0 0-.98-.1l-1.42 1.03c-.46-.22-.95-.42-1.46-.6l-.29-1.73A.75.75 0 0 0 12.5 2h-1.9a.75.75 0 0 0-.74.63l-.29 1.73c-.51.18-1 .38-1.46.6L6.7 3.63a.75.75 0 0 0-.98.1L4.37 5.08a.75.75 0 0 0-.1.98l1.03 1.42c-.22.46-.42.95-.6 1.46l-1.73.29a.75.75 0 0 0-.63.74v1.9c0 .37.27.69.63.74l1.73.29c.18.51.38 1 .6 1.46l-1.03 1.42a.75.75 0 0 0 .1.98l1.35 1.35c.26.26.66.3.98.1l1.42-1.03c.46.22.95.42 1.46.6l.29 1.73c.05.36.37.63.74.63h1.9c.37 0 .69-.27.74-.63l.29-1.73c.51-.18 1-.38 1.46-.6l1.42 1.03c.32.2.72.16.98-.1l1.35-1.35c.26-.26.3-.66.1-.98l-1.03-1.42c.22-.46.42-.95.6-1.46l1.73-.29c.36-.05.63-.37.63-.74v-1.9a.75.75 0 0 0-.63-.74Z"/>
          </svg>
        </span>
        <span className="brand-text">EZTechMovie • StreamList</span>
      </Link>

      <nav className="nav-actions">
        <NavItem to="/streamlist" label={VOCAB.tasks} />
        <NavItem to="/movies" label={VOCAB.search} />
        <NavItem to="/cart" label={VOCAB.cart} />
        <NavItem to="/about" label={VOCAB.about} />
        <LogoutButton />
      </nav>
    </header>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "nav-link" + (isActive ? " nav-link--active" : "")
      }
    >
      {label}
    </NavLink>
  );
}

function LogoutButton() {
  function handle() {
    localStorage.removeItem("sl_user");
    window.location.assign("/");
  }
  return (
    <button type="button" className="btn-gold-outline" onClick={handle}>
      Take Your Leave
    </button>
  );
}
