import { Link, NavLink } from "react-router-dom";

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
        <span className="brand-crest" aria-hidden="true" />
        <span className="brand-text">EZTechMovie • StreamList</span>
      </Link>

      <nav className="nav-actions">
        <NavItem to="/streamlist" label="Checklist" />
        <NavItem to="/movies" label="Summon Films" />
        <NavItem to="/cart" label="Cart" />
        <NavItem to="/about" label="About" />
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
