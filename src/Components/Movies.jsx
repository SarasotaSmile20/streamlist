import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import { searchMovies, posterUrl, GENRE_NAMES } from "../utils/tmdb";
import { logEvent } from "../utils/eventLogger";
import { demoHashPassword, demoVerify } from "../utils/passwordDemo";
import { usePersistentList } from "../hooks/usePersistentList";

export default function Movies() {
  // Persisted UI state
  const [query, setQuery] = useLocalStorage("streamlist:tmdb:query", "");
  const [results, setResults] = useLocalStorage("streamlist:tmdb:results", []);
  const [page, setPage] = useLocalStorage("streamlist:tmdb:page", 1);
  const [totalPages, setTotalPages] = useLocalStorage("streamlist:tmdb:total_pages", 0);
  const [favorites, setFavorites] = useLocalStorage("streamlist:tmdb:favorites", []);
  const [history, setHistory] = useLocalStorage("streamlist:tmdb:history", []); // last few queries

  const { dispatch } = usePersistentList();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Password demo (educational)
  const [demoPassword, setDemoPassword] = useState("");
  const [demoHash, setDemoHash] = useState("");

  const favoriteSet = useMemo(() => new Set(favorites.map(f => f.id)), [favorites]);

  function clearSearch() {
    setQuery("");
    setResults([]);
    setPage(1);
    setTotalPages(0);
  }

  function pushHistory(q) {
    if (!q.trim()) return;
    setHistory(prev => {
      const next = [q, ...prev.filter(x => x !== q)].slice(0, 6);
      return next;
    });
  }

  async function runSearch(p = 1) {
    // Treat empty submit as a reset to pristine state
    if (!query.trim()) {
      clearSearch();
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const data = await searchMovies(query, p);
      setResults(data.results || []);
      setPage(data.page || 1);
      setTotalPages(data.total_pages || 0);
      logEvent("tmdb_search", { query, page: p });
      pushHistory(query);
    } catch (e) {
      console.error(e);
      setErr("Failed to search TMDB. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleFavorite(movie) {
    setFavorites(prev => {
      const exists = prev.some(m => m.id === movie.id);
      const next = exists
        ? prev.filter(m => m.id !== movie.id)
        : [...prev, {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            status: "to-watch" // initial status
          }];
      logEvent(exists ? "favorite_remove" : "favorite_add", { movieId: movie.id, title: movie.title });
      return next;
    });
  }

  function addToStreamList(movie) {
    // Map first genre id -> readable name if available; else blank
    const g = Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0
      ? (GENRE_NAMES[movie.genre_ids[0]] || "")
      : "";
    dispatch({ type: "ADD", title: movie.title, genre: g });
    logEvent("tmdb_add_to_streamlist", { movieId: movie.id, title: movie.title, genre: g });
    alert(`Added to StreamList: ${movie.title}${g ? ` (${g})` : ""}`);
  }

  // Restore last search on mount if a query exists but no results loaded yet
  useEffect(() => {
    if (query && results.length === 0) runSearch(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // bcrypt demo — EDUCATIONAL ONLY (don’t hash real passwords in browser)
  async function handleDemoHash() {
    if (!demoPassword) return;
    const { hash } = await demoHashPassword(demoPassword, 10);
    setDemoHash(hash);
  }
  async function handleDemoVerify() {
    if (!demoPassword || !demoHash) return;
    const ok = await demoVerify(demoPassword, demoHash);
    alert(ok ? "Password matches demo hash ✅" : "No match ❌");
  }

  return (
    <section className="page">
      <h1 className="title">
        <span className="material-icons title-icon">local_movies</span>
        Movies
      </h1>

      <div className="toolbar" style={{ gap: 8, flexWrap: "wrap" }}>
        <Link to="/watchlist" className="btn">Open Watchlist</Link>
      </div>

      <form
        className="form"
        onSubmit={(e) => { e.preventDefault(); runSearch(1); }}
      >
        <input
          className="input"
          placeholder="Search TMDB for a movie…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search movies"
        />
        <button className="btn" disabled={loading} type="submit">
          {loading ? "Searching…" : "Search"}
        </button>
        {query && (
          <button className="btn" type="button" onClick={clearSearch}>
            Clear
          </button>
        )}
      </form>

      {/* Simple history chips */}
      {history.length > 0 && (
        <div className="hint" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {history.map(h => (
            <button
              key={h}
              className="chip"
              onClick={() => { setQuery(h); setTimeout(() => runSearch(1), 0); }}
              title={`Search "${h}"`}
            >
              {h}
            </button>
          ))}
        </div>
      )}

      {err && <p className="muted" style={{ color: "#fca5a5" }}>{err}</p>}
      {results.length > 0 && (
        <p className="muted">Page {page} of {totalPages} — showing {results.length} results</p>
      )}

      {results.length === 0 && !loading ? (
        <p className="muted">Try searching for a title like “Inception”.</p>
      ) : (
        <ul className="list">
          {results.map(m => (
            <li className="card" key={m.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12 }}>
              <img
                src={posterUrl(m.poster_path, "w154")}
                alt={m.title}
                style={{ width: 100, height: 150, objectFit: "cover", borderRadius: 10, background: "#0b1222" }}
                loading="lazy"
              />
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <strong style={{ fontSize: "1rem" }}>
                    <Link to={`/movies/${m.id}`} className="link">{m.title}</Link>
                  </strong>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="icon-btn"
                      onClick={() => toggleFavorite(m)}
                      title={favoriteSet.has(m.id) ? "Remove favorite" : "Add favorite"}
                    >
                      <span className="material-icons">{favoriteSet.has(m.id) ? "star" : "star_border"}</span>
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => addToStreamList(m)}
                      title="Add to StreamList"
                    >
                      <span className="material-icons">playlist_add</span>
                    </button>
                  </div>
                </div>
                <div className="muted" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>Year: {m.release_date?.slice(0, 4) || "—"}</span>
                  <span>Rating: {typeof m.vote_average === "number" ? m.vote_average.toFixed(1) : "—"}</span>
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  {m.overview || "No overview available."}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="toolbar" style={{ justifyContent: "flex-end" }}>
          <button
            className="btn"
            onClick={() => { const p = Math.max(1, page - 1); runSearch(p); }}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            className="btn"
            onClick={() => { const p = Math.min(totalPages, page + 1); runSearch(p); }}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}

      <div className="hint" style={{ marginTop: 16 }}>
  <strong>Favorites ({favorites.length}):</strong>{" "}
  {favorites.length === 0
    ? <span className="muted">none yet</span>
    : favorites.slice(0, 10).map(f => f.title).join(", ") + (favorites.length > 10 ? " …" : "")}
</div>


      <hr style={{ margin: "1rem 0", borderColor: "rgba(255,255,255,.06)" }} />

      <section>
        <h2 className="title" style={{ fontSize: "1.2rem" }}>
          <span className="material-icons title-icon">lock</span>
          Password Protection Demo (Salting + bcrypt)
        </h2>
        <p className="muted" style={{ marginTop: -8 }}>
          Educational only — in real apps, hashing is done on a secure server.
        </p>
        <div className="form" style={{ marginTop: 8 }}>
          <input
            className="input"
            type="password"
            placeholder="Type a demo password"
            value={demoPassword}
            onChange={(e) => setDemoPassword(e.target.value)}
          />
          <button className="btn" type="button" onClick={handleDemoHash}>Hash (bcrypt)</button>
          <button className="btn" type="button" onClick={handleDemoVerify} disabled={!demoHash}>Verify</button>
        </div>
        {demoHash && (
          <pre style={{ background: "#0b1222", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, padding: 12, overflow: "auto" }}>
{demoHash}
          </pre>
        )}
      </section>
    </section>
  );
}
