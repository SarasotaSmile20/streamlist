import { Link, NavLink } from "react-router-dom";
import { VOCAB } from "../utils/vocabulary";
import { isAdminEmail, getCurrentUserEmail } from "../utils/admin";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import heart from "../assets/projector.gif";
import "./NavBar.css";

/**
 * Gold-accent, glassy navbar to match the landing page.
 * - Brand at left with subtle gold crest dot + wordmark
 * - Links on the right; active link gets a soft gold glow
 * - Logout clears sl_user and returns to "/"
 */
export default function Navbar() {
  const email = getCurrentUserEmail();
  const isAdmin = email && isAdminEmail(email);
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
        <NavItem to="/lounge" label="Lounge" />
        {isAdmin ? <NavItem to="/admin" label="Admin" /> : null}
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
  async function handle() {
    try { await signOut(auth); } catch {}
    window.location.assign("/");
  }
  return (
    <button type="button" className="btn-gold-outline" onClick={handle}>
      Take Your Leave
    </button>
  );
}
