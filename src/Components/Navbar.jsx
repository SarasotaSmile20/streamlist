import { Link, NavLink } from "react-router-dom";
import { VOCAB } from "@utils/vocabulary";
import heart from "../assets/heart.gif";
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
          <img src={heart} alt="" className="brand-heart" />
        </span>
        <span className="brand-text">EZTechMovie • StreamList</span>
      </Link>

      <nav className="nav-actions">
        <NavItem to="/streamlist" label={VOCAB.tasks} />
        <NavItem to="/movies" label={VOCAB.navGazette} />
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
