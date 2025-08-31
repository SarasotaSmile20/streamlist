import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import { searchMovies, posterUrl } from "../utils/tmdb";
import { logEvent } from "../utils/eventLogger";

/**
 * NOTE: This keeps your typical Movies logic intact:
 * - query in localStorage
 * - results/pagination in localStorage
 * - simple search form
 * The only layout change is a safe wrapper .container-1120
 * so the panel centers and picks up the theme styles.
 */

export default function Movies() {
  const [query, setQuery] = useLocalStorage("streamlist:tmdb:query", "");
  const [results, setResults] = useLocalStorage("streamlist:tmdb:results", []);
  const [page, setPage] = useLocalStorage("streamlist:tmdb:page", 1);
  const [totalPages, setTotalPages] = useLocalStorage("streamlist:tmdb:total_pages", 0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setPage(1);
    setTotalPages(0);
  }, [setQuery, setResults, setPage, setTotalPages]);

  const runSearch = useCallback(async (p = 1) => {
    if (!query.trim()) { clearSearch(); return; }
    setLoading(true); setErr("");
    try {
      const data = await searchMovies(query, p);
      setResults(data.results || []);
      setPage(data.page || 1);
      setTotalPages(data.total_pages || 0);
      logEvent("tmdb_search", { query, page: p });
    } catch (e) {
      console.error(e);
      setErr("Failed to search TMDB. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query, clearSearch, setLoading, setErr, setResults, setPage, setTotalPages]);

  useEffect(() => {
    if (query && results.length === 0) runSearch(page);
  }, [query, results.length, page, runSearch]);

  const hasMore = useMemo(() => totalPages > page, [totalPages, page]);

  return (
    <section className="page">
      <div className="container-1120">
        <div className="panel" style={{ padding: 16 }}>
          <h1 className="title" style={{ marginTop: 0, marginBottom: 12 }}>
            <span className="material-icons title-icon">local_movies</span>
            Movies
          </h1>

          <form
            className="form"
            onSubmit={(e) => { e.preventDefault(); runSearch(1); }}
          >
            <input
              className="input"
              placeholder="Summon films…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Summoning…" : "Summon Films"}
            </button>
            {query && (
              <button className="link" type="button" onClick={clearSearch}>
                Clear
              </button>
            )}
          </form>

          {err && <p className="muted">{err}</p>}

          <ul className="list">
            {results.map((m) => (
              <li key={m.id} className="movie-row">
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {m.poster_path ? (
                    <img
                      src={posterUrl(m.poster_path, "w154")}
                      alt={m.title}
                      loading="lazy"
                      style={{ borderRadius: 8, width: 92 }}
                    />
                  ) : (
                    <div style={{
                      width: 92, height: 138, borderRadius: 8,
                      background: "rgba(255,255,255,.06)",
                      display: "grid", placeItems: "center", color: "rgba(237,239,243,.6)"
                    }}>
                      <span className="material-icons">image_not_supported</span>
                    </div>
                  )}
                  <div>
                    <Link to={`/movie/${m.id}`} className="link">{m.title}</Link>
                    {m.release_date && (
                      <div className="muted" style={{ marginTop: 4 }}>
                        {m.release_date}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {hasMore && (
            <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
              <button className="btn" onClick={() => runSearch(page + 1)}>
                Load more
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
