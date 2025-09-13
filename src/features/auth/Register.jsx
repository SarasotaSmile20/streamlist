import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "lib/firebase";

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

  function normalizeEmail(raw) {
    return (raw || "").trim().toLowerCase();
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (working) return;

    setMsg("");

    const safeEmail = normalizeEmail(email);

    if (!safeEmail || !pass || !confirm) {
      setMsg("Please fill all fields");
      return;
    }

    if (pass.length < 8) {
      setMsg("Password must be at least 8 characters");
      return;
    }

    if (pass !== confirm) {
      setMsg("Passwords do not match");
      return;
    }

    try {
      setWorking(true);

      // Create account
      const cred = await createUserWithEmailAndPassword(auth, safeEmail, pass);
      const user = cred.user;

      // Non-blocking email verification
      try {
        await sendEmailVerification(user);
      } catch (e) {
        console.warn("sendEmailVerification failed", e);
      }

      // Write/merge profile doc
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            email: user.email || safeEmail,
            createdAt: serverTimestamp(),
            provider: user.providerData?.[0]?.providerId || "password",
            emailVerified: !!user.emailVerified,
          },
          { merge: true }
        );
      } catch (e) {
        console.warn("Profile write skipped (non-fatal)", e);
      }

      nav("/streamlist", { replace: true });
    } catch (err) {
      console.error(err);
      const code = err?.code || "auth/error";
      const map = {
        "auth/email-already-in-use": "Email already in use. Try logging in.",
        "auth/invalid-email": "Invalid email address.",
        "auth/weak-password": "Password too weak (min 8 characters).",
        "auth/network-request-failed": "Network error. Check your connection.",
        "auth/too-many-requests": "Too many attempts. Please wait and try again.",
        "auth/operation-not-allowed": "Sign-ups are disabled for this project.",
      };
      setMsg(map[code] || "Could not create account. Please try again.");
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
              autoComplete="new-password"
              minLength={8}
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
              minLength={8}
              required
            />
          </label>

          {msg && (
            <div className="muted" style={{ color: "#f4c2d8", margin: "4px 2px 10px" }}>
              {msg}
            </div>
          )}

          <button type="submit" className="btn-gold" disabled={working}>
            {working ? "Creating..." : "Register"}
          </button>

          <div style={{ marginTop: 10 }}>
            <Link to="/" className="nav-link" style={{ padding: 6, borderRadius: 8 }}>
              Back to Login
            </Link>
          </div>

          <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>
            After signing up, check your email for a verification link.
          </p>
        </form>
      </section>
    </main>
  );
}
