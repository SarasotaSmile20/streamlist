import React, { useEffect, useMemo, useRef, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

// Simple error boundary to catch render/runtime errors in the chat tree
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("LoungeChat error boundary:", error, info);
  }
  reset = () => this.setState({ hasError: false, error: null });
  render() {
    if (this.state.hasError) {
      return (
        <main className="container-1120" style={{ padding: 16 }}>
          <section style={fallbackStyles.wrap}>
            <h2 style={fallbackStyles.title}>Lounge Unavailable</h2>
            <p style={fallbackStyles.text}>
              Something went wrong initializing chat. Please try again.
            </p>
            <button onClick={this.reset} style={fallbackStyles.btn} aria-label="Retry loading chat">
              Retry
            </button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

function parseDisplayName() {
  try {
    const raw = localStorage.getItem("sl_user");
    if (!raw) return null;
    let email = null;
    if (raw.startsWith("{") && raw.endsWith("}")) {
      const obj = JSON.parse(raw);
      email = obj?.email || null;
    } else {
      email = raw;
    }
    if (!email || typeof email !== "string") return null;
    const prefix = email.split("@")[0] || "";
    return prefix || null;
  } catch {
    return null;
  }
}

function guestName() {
  const id = Math.floor(1000 + Math.random() * 9000);
  return `Guest-${id}`;
}

function toMillis(ts) {
  try {
    if (!ts) return 0;
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts.seconds === "number") return ts.seconds * 1000 + (ts.nanoseconds || 0) / 1e6;
    if (typeof ts === "number") return ts;
  } catch {}
  return 0;
}

function getMessageKey(m, idx) {
  const base = typeof m?.id === "string" && m.id ? m.id : "noid";
  const t = toMillis(m?.ts) || idx || 0;
  return `${base}-${t}`;
}

export default function LoungeChat() {
  return (
    <ErrorBoundary>
      <ChatInner />
    </ErrorBoundary>
  );
}

function ChatInner() {
  const [status, setStatus] = useState("connecting"); // connecting | ready | error
  const [error, setError] = useState(null);
  const [uid, setUid] = useState(null);
  const [name, setName] = useState(guestName());
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const bottomRef = useRef(null);
  const lastSendRef = useRef(0);

  // Resolve display name from localStorage or fallback
  useEffect(() => {
    const fromLocal = parseDisplayName();
    setName(fromLocal || guestName());
  }, []);

  // Ensure anonymous sign-in
  useEffect(() => {
    setStatus("connecting");
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          await signInAnonymously(auth);
          return; // will fire again
        }
        setUid(user.uid);
        setStatus("ready");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Auth error:", err);
        setError(err);
        setStatus("error");
      }
    }, (err) => {
      setError(err);
      setStatus("error");
    });
    return () => unsubAuth?.();
  }, []);

  // Firestore subscription
  useEffect(() => {
    if (status !== "ready") return;
    const col = collection(db, "rooms", "lounge", "messages");
    const q = query(col, orderBy("ts", "asc"), limit(200));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = [];
        snap.forEach((doc) => {
          const d = doc.data() || {};
          rows.push({ id: doc.id, ...d });
        });
        setMessages(rows);
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error("Firestore subscription error:", err);
        setError(err);
        setStatus("error");
      }
    );
    return () => unsub?.();
  }, [status]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ARIA announcement of new messages
  useEffect(() => {
    if (!messages.length) return;
    const m = messages[messages.length - 1] || {};
    const who = typeof m.name === "string" && m.name.trim() ? m.name : "Someone";
    const txt = typeof m.text === "string" && m.text.trim() ? m.text : "New message";
    setLiveAnnouncement(`New message from ${who}: ${txt}`);
  }, [messages.length]);

  const canSend = useMemo(() => text.trim().length > 0 && !!uid && status === "ready", [text, uid, status]);

  const throttleMs = 1200;

  async function sendMessage() {
    const now = Date.now();
    if (now - lastSendRef.current < throttleMs) return; // throttle
    const val = text.trim();
    if (!val || !uid) return;
    try {
      lastSendRef.current = now;
      await addDoc(collection(db, "rooms", "lounge", "messages"), {
        uid,
        name: typeof name === "string" && name.trim() ? name : guestName(),
        text: val,
        ts: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Send failed:", err);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSend) return;
    sendMessage();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) sendMessage();
    }
  }

  // Styles
  const styles = {
    wrap: {
      maxWidth: 1120,
      margin: "20px auto",
      padding: 16,
      background: "linear-gradient(180deg,#121212,#0b0b0b)",
      border: "1px solid rgba(212,175,55,0.25)",
      borderRadius: 14,
      boxShadow: "0 10px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(212,175,55,0.08)",
      color: "#e6d8a2",
    },
    head: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 12,
    },
    title: {
      fontFamily: 'Macondo, "Macondo Swash Caps", serif',
      fontSize: "1.2rem",
      fontWeight: 700,
      letterSpacing: 0.5,
      color: "var(--soft-white)",
      textShadow: "none",
    },
    sub: { color: "#c9b26a", fontSize: 12 },
    list: {
      height: 420,
      overflowY: "auto",
      padding: 8,
      background: "radial-gradient(1200px 200px at 50% -60%, rgba(212,175,55,0.07), transparent)",
      border: "1px solid rgba(212,175,55,0.15)",
      borderRadius: 10,
    },
    formRow: {
      display: "flex",
      gap: 10,
      marginTop: 12,
      alignItems: "center",
    },
    label: { fontSize: 12, color: "#d7c67a" },
    input: {
      flex: 1,
      padding: "10px 12px",
      background: "#1a1a1a",
      color: "#f5e7b8",
      border: "1px solid rgba(212,175,55,0.35)",
      borderRadius: 10,
      outline: "none",
      boxShadow: "0 0 0 2px rgba(212,175,55,0.05)",
    },
    btn: {
      padding: "10px 14px",
      background: "linear-gradient(180deg,#b68d2b,#8e6c1c)",
      color: "#111",
      border: "1px solid #d4af37",
      borderRadius: 10,
      fontWeight: 700,
      cursor: "pointer",
      textShadow: "0 1px 0 rgba(255,255,255,0.3)",
      boxShadow: "0 6px 16px rgba(212,175,55,0.25), inset 0 0 8px rgba(255,255,255,0.12)",
    },
    btnDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    msgRow: { display: "flex", margin: "8px 0" },
    bubbleMine: {
      marginLeft: "auto",
      maxWidth: "70%",
      background: "linear-gradient(180deg,#2a220f,#201a0d)",
      border: "1px solid rgba(212,175,55,0.5)",
      color: "#ffe9a6",
      padding: "8px 12px",
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.4), inset 0 0 10px rgba(212,175,55,0.1)",
    },
    bubbleOther: {
      marginRight: "auto",
      maxWidth: "70%",
      background: "linear-gradient(180deg,#161616,#101010)",
      border: "1px solid rgba(212,175,55,0.25)",
      color: "#e8d9a4",
      padding: "8px 12px",
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    },
    name: { fontSize: 12, color: "#c9b26a", marginBottom: 4 },
    text: { fontSize: 14, lineHeight: 1.35 },
    srOnly: {
      position: "absolute",
      width: 1,
      height: 1,
      padding: 0,
      margin: -1,
      overflow: "hidden",
      clip: "rect(0,0,0,0)",
      whiteSpace: "nowrap",
      border: 0,
    },
    statusBar: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "#c9b26a",
      fontSize: 12,
      marginBottom: 8,
    },
    spinner: {
      width: 14,
      height: 14,
      border: "2px solid rgba(212,175,55,0.35)",
      borderTopColor: "#d4af37",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
  };

  const isConnecting = status === "connecting";
  const hasError = status === "error";

  return (
    <main className="container-1120" style={{ padding: 16 }}>
      <section style={styles.wrap}>
        <header style={styles.head}>
          <h2 style={styles.title}>Lounge</h2>
          <div style={styles.sub}>Signed in as: {typeof name === "string" ? name : "Guest"}</div>
        </header>

        {/* Connection status / spinner */}
        <div role="status" aria-live="polite" style={styles.statusBar}>
          {isConnecting && (
            <>
              <span style={styles.spinner} aria-hidden="true" />
              <span aria-busy="true">Connecting to lounge…</span>
            </>
          )}
          {hasError && (
            <>
              <span>Could not connect to chat.</span>
              <span>{error?.message ? ` (${error.message})` : ""}</span>
            </>
          )}
        </div>

        <div
          style={styles.list}
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Lounge messages"
          aria-busy={isConnecting}
        >
          {messages.map((m, idx) => {
            const mine = m?.uid && uid && m.uid === uid;
            const displayName = typeof m?.name === "string" && m.name.trim() ? m.name : "Anon";
            const displayText = typeof m?.text === "string" ? m.text : "";
            return (
              <div key={getMessageKey(m, idx)} style={styles.msgRow}>
                <div style={mine ? styles.bubbleMine : styles.bubbleOther}>
                  <div style={styles.name}>{displayName}</div>
                  <div style={styles.text}>{displayText}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Screen reader live region for new messages */}
        <div role="status" aria-live="polite" aria-atomic="true" style={styles.srOnly}>
          {liveAnnouncement}
        </div>

        <form onSubmit={handleSubmit} style={styles.formRow}>
          <label htmlFor="lounge-input" style={styles.label}>
            Your Message
          </label>
          <input
            id="lounge-input"
            type="text"
            placeholder="Share a thought with the guild..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.input}
            autoComplete="off"
            aria-label="Type your lounge message"
            disabled={status !== "ready"}
          />
          <button
            type="submit"
            style={{ ...styles.btn, ...(canSend ? null : styles.btnDisabled) }}
            disabled={!canSend}
            aria-disabled={!canSend}
            aria-label="Send message"
            title={canSend ? "Send message (Enter)" : "Cannot send yet"}
          >
            Send
          </button>
        </form>
      </section>
      {/* Inline keyframes for spinner */}
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </main>
  );
}

const fallbackStyles = {
  wrap: {
    maxWidth: 1120,
    margin: "20px auto",
    padding: 16,
    background: "linear-gradient(180deg,#121212,#0b0b0b)",
    border: "1px solid rgba(212,175,55,0.25)",
    borderRadius: 14,
    boxShadow: "0 10px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(212,175,55,0.08)",
    color: "#e6d8a2",
    textAlign: "center",
  },
  title: {
    fontFamily: 'Macondo, "Macondo Swash Caps", serif',
    fontSize: "1.2rem",
    fontWeight: 700,
    letterSpacing: 0.5,
    color: "var(--soft-white)",
    textShadow: "none",
    marginBottom: 8,
  },
  text: { color: "#c9b26a", marginBottom: 12 },
  btn: {
    padding: "10px 14px",
    background: "linear-gradient(180deg,#b68d2b,#8e6c1c)",
    color: "#111",
    border: "1px solid #d4af37",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
    textShadow: "0 1px 0 rgba(255,255,255,0.3)",
    boxShadow: "0 6px 16px rgba(212,175,55,0.25), inset 0 0 8px rgba(255,255,255,0.12)",
    display: "inline-block",
  },
};
