import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@lib/firebase"; // ✅ simplified import

/**
 * Gold/Victorian styled login screen
 * - Uses projector background via body.curtain-mode (set in CSS)
 * - Glassy card, gold accents, subtle pink focus ring
 */
export default function CurtainLogin() {
  const navigate = useNavigate();
  const emailRef = useRef(null);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [working, setWorking] = useState(false);
  const [resetInfo, setResetInfo] = useState("");

  useEffect(() => {
    emailRef.current?.focus();
    document.body.classList.add("curtain-mode");
    return () => document.body.classList.remove("curtain-mode");
  }, []);

  const normalizeEmail = (raw) => (raw || "").trim().toLowerCase();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (working) return;

    setMsg("");
    setResetInfo("");

    const safeEmail = normalizeEmail(email);
    if (!safeEmail || !pass) {
      setMsg("Please enter your email and password.");
      return;
    }

    try {
      setWorking(true);
      const cred = await signInWithEmailAndPassword(auth, safeEmail, pass);
      const user = cred.user;

      // Non-blocking profile upsert
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            email: user.email || safeEmail,
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn("Profile write skipped (non-fatal)", e);
      }

      navigate("/streamlist", { replace: true });
    } catch (err) {
      console.error(err);
      const code = err?.code || "auth/error";
      const map = {
        "auth/invalid-email": "Invalid email address.",
        "auth/user-disabled": "This account is disabled.",
        "auth/user-not-found": "No account found. Please register.",
        "auth/wrong-password": "Incorrect email or password.",
        "auth/too-many-requests":
          "Too many attempts. Please wait a moment and try again.",
        "auth/network-request-failed":
          "Network error. Check your connection and try again.",
        "auth/operation-not-allowed":
          "Email/password sign-in is disabled in this project.",
      };
      setMsg(map[code] || "Login failed. Please try again.");
    } finally {
      setWorking(false);
    }
  };

  const onForgotPassword = async () => {
    setMsg("");
    setResetInfo("");
    const safeEmail = normalizeEmail(email);
    if (!safeEmail) {
      setMsg("Enter your email above, then click Forgot Password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, safeEmail);
      setResetInfo(
        "If an account exists for that email, a reset link has been sent."
      );
    } catch (err) {
      console.error(err);
      const code = err?.code || "auth/error";
      const map = {
        "auth/invalid-email": "Invalid email address.",
        "auth/user-not-found":
          "If an account exists for that email, a reset link will be sent.",
        "auth/too-many-requests":
          "Too many attempts. Please wait a moment and try again.",
      };
      setMsg(map[code] || "Could not send reset email. Please try again.");
    }
  };

  return (
    <main className="landing-hero">
      <header className="landing-head">
        <h1 className="brandmark">EZTechMovie • StreamList</h1>
        <p className="tagline">Find it. Watch it. Love it.</p>
      </header>

      <section className="signin-wrap">
        <form className="signin-card" onSubmit={onSubmit} noValidate>
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
              inputMode="email"
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

          {msg && (
            <div
              className="muted"
              style={{ color: "#f4c2d8", margin: "4px 2px 8px" }}
            >
              {msg}
            </div>
          )}

          {resetInfo && (
            <div className="muted" style={{ margin: "0 2px 8px" }}>
              {resetInfo}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
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

            <button
              type="button"
              className="nav-link"
              onClick={onForgotPassword}
              style={{ marginLeft: "auto", padding: 6, borderRadius: 8 }}
            >
              Forgot password?
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
