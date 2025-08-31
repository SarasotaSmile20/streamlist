import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { demoVerify } from "../utils/passwordDemo";

/**
 * Gold/Victorian styled login screen
 * - Uses projector background via body.stage-bg (set in CSS)
 * - Glassy card, gold accents, subtle pink focus ring
 */
export default function CurtainLogin() {
  const navigate = useNavigate();
  const emailRef = useRef(null);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  useEffect(() => {
    emailRef.current?.focus();
    document.body.classList.add("curtain-mode");
    return () => document.body.classList.remove("curtain-mode");
  }, []);

  const [msg, setMsg] = useState("");
  const [working, setWorking] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setWorking(true);
    try {
      const accounts = JSON.parse(localStorage.getItem("sl_accounts") || "{}");
      const account = accounts[email];
      if (!account) {
        setMsg("No account found. Please register.");
        return;
      }
      const ok = await demoVerify(pass, account.hash);
      if (!ok) {
        setMsg("Incorrect email or password.");
        return;
      }
      localStorage.setItem("sl_user", JSON.stringify({ email }));
      navigate("/streamlist", { replace: true });
    } catch (err) {
      console.error(err);
      setMsg("Login failed.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <main className="landing-hero">
      <header className="landing-head">
        <h1 className="brandmark">EZTechMovie • StreamList</h1>
        <p className="tagline">Find it. Watch it. Love it.</p>
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
              autoComplete="current-password"
              required
            />
          </label>

          {msg ? (
            <div className="muted" style={{ color: "#f4c2d8", margin: "4px 2px 10px" }}>{msg}</div>
          ) : null}

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button type="submit" className="btn-gold" disabled={working}>
              {working ? "Checking..." : "Present Your Papers"}
            </button>
            <button
              type="button"
              className="btn-teal"
              onClick={() => navigate("/register")}
            >
              New here? Join the Guild
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
