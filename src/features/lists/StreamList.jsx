// src/Components/StreamList.jsx
import { useRef, useState, useMemo } from "react";
import ItemRow from "@features/lists/ItemRow";
import { VOCAB } from "@utils/vocabulary";
import { usePersistentList } from "@hooks/usePersistentList";

const COMMON_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama",
  "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance",
  "Sci-Fi", "Thriller", "War", "Western", "Other"
];

/* =========================
   Helpers
   ========================= */
const toISOorEmpty = (v) => {
  if (v == null || v === "") return "";
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d.toISOString() : "";
};

const parseMaybeDate = (v) => {
  if (!v) return null;
  const n = Number(v);
  if (Number.isFinite(n)) return n;
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : null;
};

const normalizeTitle = (t) =>
  String(t || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const numericId = (id) => {
  const n = Number(id);
  return Number.isInteger(n) && n >= 0 ? n : null;
};

const nextIdSeed = (items) => {
  const max = items.reduce((m, it) => {
    const n = numericId(it.id);
    return n != null && n > m ? n : m;
  }, 0);
  return max;
};

/* =========================
   Component
   ========================= */
export default function StreamList() {
  const { items, remaining, dispatch } = usePersistentList();

  const [input, setInput] = useState("");
  const [genreChoice, setGenreChoice] = useState("");
  const [customGenre, setCustomGenre] = useState("");

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [genreFilter, setGenreFilter] = useState("ALL");

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);

  const fileInputJSONRef = useRef(null);
  const fileInputCSVRef = useRef(null);

  /* ---------- Add item ---------- */
  const submit = (e) => {
    e.preventDefault();
    const titleRaw = input;
    const title = titleRaw.trim();
    if (!title) return;

    const key = normalizeTitle(title);
    const exists = items.some((it) => normalizeTitle(it.title) === key);
    if (exists) {
      alert(`“${title}” is already in your list.`);
      return;
    }

    const resolved =
      genreChoice === "Other" ? customGenre.trim() : (genreChoice || "").trim();

    dispatch({ type: "ADD", title, genre: resolved });
    setInput("");
    setGenreChoice("");
    setCustomGenre("");
  };

  const onToggle = (id) => dispatch({ type: "TOGGLE", id });
  const onDelete = (id) => dispatch({ type: "DELETE", id });

  const onEdit = (id, patch) => {
    const payload = { type: "EDIT", id };

    if (patch && typeof patch.title === "string") {
      const newTitle = patch.title.trim();
      if (newTitle) {
        const key = normalizeTitle(newTitle);
        const clash = items.find(
          (it) => it.id !== id && normalizeTitle(it.title) === key
        );
        if (clash) {
          alert(`You already have “${newTitle}”.`);
          return;
        }
        payload.title = newTitle;
      }
    }

    if (patch && typeof patch.genre !== "undefined") {
      payload.genre = patch.genre;
    }

    dispatch(payload);
  };

  const clearDone = () => dispatch({ type: "CLEAR_DONE" });

  /* ---------- Export / Import ---------- */
  const download = (filename, text, type = "application/octet-stream") => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const payload = { version: 1, items };
    download("streamlist-backup.json", JSON.stringify(payload, null, 2), "application/json");
  };

  const exportCSV = () => {
    const esc = (v) => {
      if (v == null) return "";
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [
      ["id", "title", "genre", "completed", "createdAt", "completedAt"],
      ...items.map((it) => [
        it.id ?? "",
        it.title ?? "",
        it.genre ?? "",
        it.completed ? "true" : "false",
        toISOorEmpty(it.createdAt),
        toISOorEmpty(it.completedAt),
      ]),
    ];
    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    download("streamlist.csv", csv, "text/csv");
  };

  const onChooseImportJSON = () => fileInputJSONRef.current?.click();
  const onChooseImportCSV = () => fileInputCSVRef.current?.click();

  const normalizeItem = (i) => ({
    id: i.id ?? null,
    title: String(i.title ?? "").trim(),
    genre: typeof i.genre === "string" ? i.genre : "",
    completed: !!i.completed,
    createdAt:
      typeof i.createdAt === "number"
        ? i.createdAt
        : (i.createdAt ? Date.parse(i.createdAt) : Date.now()),
    completedAt:
      typeof i.completedAt === "number"
        ? i.completedAt
        : (i.completedAt && i.completedAt !== "Not completed yet" ? Date.parse(i.completedAt) : null),
  });

  const mergeLists = (existing, incomingRaw) => {
    const incoming = incomingRaw.map(normalizeItem);
    const byTitle = new Map(existing.map((it) => [normalizeTitle(it.title), it]));
    let nextId = nextIdSeed(existing);
    const merged = [...existing];

    for (const inc of incoming) {
      const tkey = normalizeTitle(inc.title);
      if (byTitle.has(tkey)) continue;

      nextId += 1;
      const withId = {
        ...inc,
        id: String(nextId),
        createdAt: inc.createdAt ?? Date.now(),
      };
      merged.push(withId);
      byTitle.set(tkey, withId);
    }
    return merged;
  };

  const onImportJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      let incoming = [];
      if (Array.isArray(parsed)) incoming = parsed;
      else if (parsed && Array.isArray(parsed.items)) incoming = parsed.items;
      else throw new Error("Unrecognized JSON shape");

      const merged = mergeLists(items, incoming);
      dispatch({ type: "REPLACE", items: merged });
      alert("JSON import merged successfully!");
    } catch (err) {
      console.error(err);
      alert("Import failed. Please select a valid JSON backup.");
    } finally {
      e.target.value = "";
      setShowImportMenu(false);
    }
  };

  const parseCSVLine = (line) => {
    const re = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g;
    const out = [];
    line.replace(re, (_, quoted, plain) => {
      if (quoted != null) out.push(quoted.replace(/""/g, '"'));
      else out.push(plain ?? "");
      return "";
    });
    return out;
  };

  const onImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length === 0) throw new Error("Empty CSV");
      const headers = parseCSVLine(lines[0]);

      const incoming = lines.slice(1).map((ln) => {
        const vals = parseCSVLine(ln);
        const rec = Object.fromEntries(headers.map((h, i) => [h, vals[i]]));
        return {
          id: rec.id || null,
          title: rec.title || "",
          genre: rec.genre || "",
          completed: String(rec.completed).toLowerCase() === "true",
          createdAt: parseMaybeDate(rec.createdAt) ?? Date.now(),
          completedAt: parseMaybeDate(rec.completedAt),
        };
      });

      const merged = mergeLists(items, incoming);
      dispatch({ type: "REPLACE", items: merged });
      alert("CSV import merged successfully!");
    } catch (err) {
      console.error(err);
      alert("Import failed. Please select a valid CSV exported by this app.");
    } finally {
      e.target.value = "";
      setShowImportMenu(false);
    }
  };

  const genreOptions = useMemo(() => {
    const set = new Set(items.map((i) => i.genre).filter(Boolean));
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const filtered = useMemo(() => {
    let out = items;
    if (filter === "active") out = out.filter((i) => !i.completed);
    if (filter === "completed") out = out.filter((i) => i.completed);
    if (genreFilter !== "ALL") out = out.filter((i) => (i.genre || "") === genreFilter);
    if (sortBy === "az") out = [...out].sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "za") out = [...out].sort((a, b) => b.title.localeCompare(a.title));
    return out;
  }, [items, filter, genreFilter, sortBy]);

  const onBackgroundClick = () => {
    setShowExportMenu(false);
    setShowImportMenu(false);
  };

  /* ---------- Render ---------- */
  return (
    <section className="page ledger-page" onClick={onBackgroundClick}>
      <div className="container-1120">
        {/* Title left; actions move next to form */}
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          <h1 className="title font-cinzelDecorative text-primary title-engrave" style={{ margin: 0 }}>
            <span className="material-icons title-icon">playlist_add_check</span>
            StreamList
          </h1>
        </div>

        {/* Add form with actions on the right */}
        <div className="row-streamlist">
        <form className="form form-streamlist" onSubmit={submit}>
          <input
            className="input add-title"
            type="text"
            placeholder="Add a movie or show…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label={VOCAB.addToList}
            autoComplete="off"
            onKeyDown={(e) => e.key === "Enter" && submit(e)}
            style={{ flex: "0 1 auto" }}
          />

          <select
            className="input"
            value={genreChoice}
            onChange={(e) => setGenreChoice(e.target.value)}
            aria-label="Genre"
            style={{ flex: "0 1 auto" }}
          >
            <option value="">Select genre…</option>
            {COMMON_GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <button className="btn" type="submit" aria-label="Add">
            <span className="material-icons">add</span>
            Add
          </button>

          {genreChoice === "Other" && (
            <input
              className="input custom-genre"
              type="text"
              placeholder="Custom genre"
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              aria-label="Custom genre"
              autoComplete="off"
              style={{ flex: "0 1 auto" }}
            />
          )}

        </form>
        </div>

        {/* Toolbar */}
        <div className="toolbar toolbar-streamlist" style={{ rowGap: 8 }}>
          <div className="filters" role="tablist" aria-label="Filter items">
            <button
              className={`chip ${filter === "all" ? "chip-active" : ""}`}
              onClick={() => setFilter("all")}
              role="tab"
              aria-selected={filter === "all"}
            >
              <span className="material-icons chip-icon">list</span> All
            </button>
          </div>

          <div className="filters" role="tablist" aria-label="Filter items">
            <button
              className={`chip ${filter === "active" ? "chip-active" : ""}`}
              onClick={() => setFilter("active")}
              role="tab"
              aria-selected={filter === "active"}
            >
              <span className="material-icons chip-icon">radio_button_unchecked</span> Active
            </button>
            <button
              className={`chip ${filter === "completed" ? "chip-active" : ""}`}
              onClick={() => setFilter("completed")}
              role="tab"
              aria-selected={filter === "completed"}
            >
              <span className="material-icons chip-icon">check_circle</span> Done
            </button>
          </div>

          <div className="meta" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span className="muted">{remaining} remaining</span>

            <label className="muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-icons" style={{ fontSize: 18 }}>category</span>
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                aria-label="Filter by genre"
                className="input"
                style={{ padding: "6px 8px" }}
              >
                {genreOptions.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>

            <label className="muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-icons" style={{ fontSize: 18 }}>sort_by_alpha</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort by title"
                className="input"
                style={{ padding: "6px 8px" }}
              >
                <option value="default">Default</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
              </select>
            </label>

            {items.length > 0 && (
              <button className="link danger" onClick={clearDone} title="Clear completed">
                <span className="material-icons">delete_sweep</span> Clear done
              </button>
            )}
          </div>
        </div>

        {/* Bottom actions (keep this set) */}
        <div className="row-actions-bottom">
          <ExportMenu
            onCSV={() => exportCSV()}
            onJSON={() => exportJSON()}
            show={showExportMenu}
            setShow={setShowExportMenu}
            hideOther={() => setShowImportMenu(false)}
          />
          <ImportMenu
            onCSV={() => onChooseImportCSV()}
            onJSON={() => onChooseImportJSON()}
            show={showImportMenu}
            setShow={setShowImportMenu}
            hideOther={() => setShowExportMenu(false)}
          />
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <p className="empty muted">No items yet. Add your first title above.</p>
        ) : (
          <ul className="list">
            {filtered.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputJSONRef}
          type="file"
          accept="application/json,.json"
          onChange={onImportJSON}
          style={{ display: "none" }}
          aria-hidden="true"
          tabIndex={-1}
        />
        <input
          ref={fileInputCSVRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onImportCSV}
          style={{ display: "none" }}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
    </section>
  );
}

/* ---------- Small pop menus ---------- */
function ExportMenu({ onCSV, onJSON, show, setShow, hideOther }) {
  return (
    <div style={{ position: "relative", marginRight: 8 }}>
      <button
        type="button"
        className="btn"
        onClick={(e) => {
          e.stopPropagation();
          setShow((v) => !v);
          hideOther();
        }}
        title="Export your list"
      >
        <span className="material-icons" style={{ verticalAlign: "middle", marginRight: 4 }}>
          file_download
        </span>
        Export
      </button>

      {show && (
        <div role="menu" style={menuStyles} onClick={(e) => e.stopPropagation()}>
          <button className="link" onClick={() => { onCSV(); setShow(false); }}>
            <span className="material-icons" style={iconSm}>table_view</span> CSV
          </button>
          <button className="link" onClick={() => { onJSON(); setShow(false); }}>
            <span className="material-icons" style={iconSm}>description</span> JSON
          </button>
        </div>
      )}
    </div>
  );
}

function ImportMenu({ onCSV, onJSON, show, setShow, hideOther }) {
  return (
    <div style={{ position: "relative", marginLeft: 8 }}>
      <button
        type="button"
        className="btn"
        onClick={(e) => {
          e.stopPropagation();
          setShow((v) => !v);
          hideOther();
        }}
        title="Import a list"
      >
        <span className="material-icons" style={{ verticalAlign: "middle", marginRight: 4 }}>
          file_upload
        </span>
        Import
      </button>

      {show && (
        <div role="menu" style={menuStyles} onClick={(e) => e.stopPropagation()}>
          <button className="link" onClick={() => onCSV()}>
            <span className="material-icons" style={iconSm}>upload_file</span> CSV
          </button>
          <button className="link" onClick={() => onJSON()}>
            <span className="material-icons" style={iconSm}>description</span> JSON
          </button>
        </div>
      )}
    </div>
  );
}

const menuStyles = {
  position: "absolute",
  top: "110%",
  left: 0,
  background: "var(--panel, #1f2430)",
  padding: 8,
  borderRadius: 10,
  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  minWidth: 140,
  zIndex: 50,
};

const iconSm = { fontSize: 18, verticalAlign: "middle", marginRight: 6 };
