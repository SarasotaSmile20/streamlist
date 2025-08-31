import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { demoHashPassword } from "../utils/passwordDemo";

function loadAccounts() {
  try {
    return JSON.parse(localStorage.getItem("sl_accounts")) || {};
  } catch {
    return {};
  }
}

function saveAccounts(accounts) {
  localStorage.setItem("sl_accounts", JSON.stringify(accounts));
}

export default function Register() {
  const nav = useNavigate();
  const emailRef = useRef(null);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
    document.body.classList.add("curtain-mode");
    return () => document.body.classList.remove("curtain-mode");
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!email || !pass) return setMsg("Please fill all fields");
    if (pass !== confirm) return setMsg("Passwords do not match");
    const accounts = loadAccounts();
    if (accounts[email]) {
      return setMsg("Account already exists. Try logging in.");
    }
    try {
      setWorking(true);
      const { hash } = await demoHashPassword(pass, 10);
      accounts[email] = { hash, createdAt: Date.now() };
      saveAccounts(accounts);
      // Auto-login
      localStorage.setItem("sl_user", JSON.stringify({ email }));
      nav("/streamlist", { replace: true });
    } catch (err) {
      console.error(err);
      setMsg("Could not create account");
    } finally {
      setWorking(false);
    }
  };

  return (
    <main className="landing-hero">
      <header className="landing-head">
        <h1 className="brandmark">Create Account</h1>
        <p className="tagline">Welcome to StreamList</p>
      </header>

      <section className="signin-wrap">
        <form className="signin-card" onSubmit={onSubmit}>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              ref={emailRef}
              className="field-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Confirm Password</span>
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          {msg ? (
            <div className="muted" style={{ color: "#f4c2d8", margin: "4px 2px 10px" }}>{msg}</div>
          ) : null}

          <button type="submit" className="btn-gold" disabled={working}>
            {working ? "Creating..." : "Register"}
          </button>

          <div style={{ marginTop: 10 }}>
            <Link to="/" className="nav-link" style={{ padding: 6, borderRadius: 8 }}>
              Back to Login
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

