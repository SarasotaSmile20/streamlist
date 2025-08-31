import { useEffect, useRef, useState } from "react";

const COMMON_GENRES = [
  "Action","Adventure","Animation","Comedy","Crime","Documentary","Drama",
  "Family","Fantasy","History","Horror","Music","Mystery","Romance",
  "Sci-Fi","Thriller","War","Western","Other"
];

const fmtDate = (v) => {
  if (v == null || v === "") return "Unknown";
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString() : "Unknown";
};

export default function ItemRow({ item, onToggle, onEdit, onDelete }) {
  const createdDate = fmtDate(item.createdAt);
  const hasCompleted = item.completed && item.completedAt != null;
  const completedDate = item.completedAt ? fmtDate(item.completedAt) : "Not completed yet";

  // --- inline edit state ---
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [genre, setGenre] = useState(item.genre || "");
  const titleRef = useRef(null);

  useEffect(() => {
    if (editing) {
      titleRef.current?.focus();
      titleRef.current?.select();
    }
  }, [editing]);

  // keep local state in sync if list updates externally
  useEffect(() => {
    setTitle(item.title);
    setGenre(item.genre || "");
  }, [item.title, item.genre]);

  const startEdit = () => setEditing(true);
  const cancelEdit = () => {
    setTitle(item.title);
    setGenre(item.genre || "");
    setEditing(false);
  };
  const saveEdit = () => {
    const patch = {
      title: String(title).trim() || item.title,
      genre: String(genre).trim(), // allow clearing with ""
    };
    onEdit(item.id, patch);
    setEditing(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); saveEdit(); }
    else if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
  };

  return (
    <li className="item" style={styles.card}>
      <div className="row" style={styles.row}>
        <label className="checkbox" style={styles.checkbox}>
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => onToggle(item.id)}
            aria-label={item.completed ? "Mark as active" : "Mark as completed"}
          />
          <span className="checkmark" />
        </label>

        <div style={styles.main}>
          {!editing ? (
            <>
              <div className="title-wrap" style={styles.titleWrap}>
                <span
                  className={`item-title ${item.completed ? "done" : ""}`}
                  style={styles.title}
                  title={item.title}
                >
                  {item.title}
                </span>
                {item.genre ? (
                  <span className="muted" style={styles.tag} title={`Genre: ${item.genre}`}>
                    {item.genre}
                  </span>
                ) : null}
              </div>

              <div className="dates" style={styles.dates}>
                <small className="muted" style={styles.dateChip}>
                  <strong>Created:</strong> {createdDate}
                </small>
                <small
                  className="muted"
                  style={{ ...styles.dateChip, marginLeft: 8, opacity: hasCompleted ? 0.85 : 0.7 }}
                >
                  <strong>Completed:</strong> {completedDate}
                </small>
              </div>
            </>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 220px auto auto", gap: 8, alignItems: "center" }}>
              <input
                ref={titleRef}
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Edit title"
                placeholder="Title"
              />
              <input
                className="input"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Edit genre"
                placeholder="Genre (e.g., Action)"
                list="genre-suggestions"
              />
              <datalist id="genre-suggestions">
                {COMMON_GENRES.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
              <button className="btn-mini" onClick={saveEdit} aria-label="Save edits">Save</button>
              <button className="link" onClick={cancelEdit} aria-label="Cancel editing">Cancel</button>
            </div>
          )}
        </div>

        <div className="actions" style={styles.actions}>
          {!editing ? (
            <button className="btn-mini" onClick={startEdit} title="Edit" aria-label="Edit">Edit</button>
          ) : (
            <button className="btn-mini" onClick={saveEdit} title="Save" aria-label="Save">Save</button>
          )}
          <button className="btn-mini danger" onClick={() => onDelete(item.id)} title="Delete" aria-label="Delete">Delete</button>
        </div>
      </div>
    </li>
  );
}

const styles = {
  card: { padding: "6px 10px", marginBottom: 6, lineHeight: 1.4, borderRadius: 12 },
  row: { display: "flex", alignItems: "center", gap: 10 },
  checkbox: { display: "flex", alignItems: "center" },
  main: { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 },
  titleWrap: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  title: { fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  tag: { fontSize: "0.75rem", padding: "2px 6px", borderRadius: 8, background: "rgba(255,255,255,0.08)" },
  dates: { display: "flex", alignItems: "center", flexWrap: "wrap" },
  dateChip: { opacity: 0.8 },
  actions: { display: "flex", alignItems: "center", gap: 6, marginLeft: 6 },
  iconBtn: { padding: 6, borderRadius: 10 },
};
