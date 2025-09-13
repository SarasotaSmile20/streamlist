/**
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId}/messages/{msgId} {
      allow read, write: if true;
    }
  }
}
*/

import { useEffect, useMemo, useRef, useState } from "react";
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

function parseDisplayName() {
  try {
    const raw = localStorage.getItem("sl_user");
    if (!raw) return null;
    let email = null;
    if (raw.startsWith("{") && raw.endsWith("}")) {
      const obj = JSON.parse(raw);
      email = obj?.email || null;
    } else {
      // Sometimes stored as a plain string
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

export default function LoungeChat() {
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState(null);
  const [name, setName] = useState(guestName());
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  // Resolve display name from localStorage or fallback
  useEffect(() => {
    const fromLocal = parseDisplayName();
    setName(fromLocal || guestName());
  }, []);

  // Ensure anonymous sign-in, then subscribe to messages
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          await signInAnonymously(auth);
          return; // onAuthStateChanged will fire again
        }
        setUid(user.uid);
        setReady(true);
      } catch (err) {
        console.error("Auth error:", err);
      }
    });
    return () => unsubAuth?.();
  }, []);

  // Firestore subscription
  useEffect(() => {
    if (!ready) return;
    const col = collection(db, "rooms", "lounge", "messages");
    const q = query(col, orderBy("ts", "asc"), limit(200));
    const unsub = onSnapshot(q, (snap) => {
      const rows = [];
      snap.forEach((doc) => {
        const d = doc.data();
        rows.push({ id: doc.id, ...d });
      });
      setMessages(rows);
    });
    return () => unsub();
  }, [ready]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const canSend = useMemo(() => text.trim().length > 0 && !!uid, [text, uid]);

  async function handleSend(e) {
    e.preventDefault();
    const val = text.trim();
    if (!val || !uid) return;
    try {
      await addDoc(collection(db, "rooms", "lounge", "messages"), {
        uid,
        name,
        text: val,
        ts: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error("Send failed:", err);
    }
  }

  // Steampunk/Dark inline styles
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
      fontSize: '1.2rem',
      fontWeight: 700,
      letterSpacing: 0.5,
      color: 'var(--soft-white)',
      textShadow: 'none',
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
  };

  return (
    <main className="container-1120" style={{ padding: 16 }}>
      <section style={styles.wrap}>
        <header style={styles.head}>
          <h2 style={styles.title}>Lounge</h2>
          <div style={styles.sub}>Signed in as: {name}</div>
        </header>

        <div
          style={styles.list}
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Lounge messages"
        >
          {messages.map((m) => {
            const mine = m.uid && uid && m.uid === uid;
            return (
              <div key={m.id} style={styles.msgRow}>
                <div style={mine ? styles.bubbleMine : styles.bubbleOther}>
                  <div style={styles.name}>{m.name || "Anon"}</div>
                  <div style={styles.text}>{m.text}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} style={styles.formRow}>
          <label htmlFor="lounge-input" style={styles.label}>
            Your Message
          </label>
          <input
            id="lounge-input"
            type="text"
            placeholder="Share a thought with the guild..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={styles.input}
            autoComplete="off"
            aria-label="Type your lounge message"
            disabled={!ready}
          />
          <button type="submit" style={styles.btn} disabled={!canSend}>
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
