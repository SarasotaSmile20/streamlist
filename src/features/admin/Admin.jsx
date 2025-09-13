import { useEffect, useState } from "react";
import { readRegisteredAccounts } from "@utils/admin";
import { Timestamp } from "firebase/firestore";

export default function Admin() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await readRegisteredAccounts();
      if (!active) return;
      setAccounts(rows);
    })();
    return () => { active = false; };
  }, []);

  return (
    <section className="page ledger-page">
      <div className="container-1120">
        <h1 className="title page-heading--nav" style={{ marginBottom: 12 }}>
          <span className="material-icons title-icon">admin_panel_settings</span>
          Admin
        </h1>

        <p className="muted" style={{ marginBottom: 16 }}>
          Registrations • Total accounts: {accounts.length}
        </p>

        {accounts.length === 0 ? (
          <p className="empty muted">No registrations found.</p>
        ) : (
          <div className="panel" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Email</th>
                  <th style={th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.email}>
                    <td style={td}>{a.email}</td>
                    <td style={td}>{formatDate(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

const th = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const td = {
  padding: "10px 8px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

function formatDate(ts) {
  if (!ts) return "-";
  try {
    if (ts instanceof Timestamp) {
      return ts.toDate().toLocaleString();
    }
    // Firestore may return { seconds, nanoseconds }
    if (typeof ts === "object" && typeof ts.seconds === "number") {
      return new Date(ts.seconds * 1000).toLocaleString();
    }
  } catch {}
  const d = new Date(ts);
  return Number.isFinite(d.getTime()) ? d.toLocaleString() : String(ts);
}
