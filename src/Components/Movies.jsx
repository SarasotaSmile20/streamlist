import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import { searchMovies, searchPeople, discoverMovies, posterUrl, GENRE_NAMES, GENRE_IDS_BY_NAME } from "../services/tmdb";
import { usePersistentList } from "../hooks/usePersistentList";
import { VOCAB } from "../utils/vocabulary";
import { logEvent } from "../utils/eventLogger";
import letterGif from "../assets/Letter.gif";
import clockGif from "../assets/Clock.gif"; // retained if used elsewhere
import keyImg from "../assets/key.jpeg";
import dinoGif from "../assets/dino.gif";
import bulldozerGif from "../assets/bulldozer.gif";
import heartGif from "../assets/heart.gif";

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
  const [mode, setMode] = useLocalStorage("streamlist:tmdb:mode", "title"); // title | actor | genre | new
  const [genreName, setGenreName] = useLocalStorage("streamlist:tmdb:genre", "");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [favorites, setFavorites] = useLocalStorage("streamlist:tmdb:favorites", []);
  const { items, dispatch } = usePersistentList();
  const [selected, setSelected] = useState({}); // id:boolean
  const [favSelected, setFavSelected] = useState({}); // favorites selection

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setPage(1);
    setTotalPages(0);
  }, [setQuery, setResults, setPage, setTotalPages]);

  const runSearch = useCallback(async (p = 1) => {
    // For title/actor we require a text query; for genre/new we don't
    if ((mode === "title" || mode === "actor") && !query.trim()) { clearSearch(); return; }
    if (mode === "genre" && !genreName) { setErr("Pick a genre."); return; }
    setLoading(true); setErr("");
    try {
      let data;
      if (mode === "title") {
        data = await searchMovies(query, p);
      } else if (mode === "actor") {
        const people = await searchPeople(query, 1);
        const person = (people.results || [])[0];
        if (!person) { setResults([]); setPage(1); setTotalPages(0); setLoading(false); return; }
        data = await discoverMovies({ with_cast: person.id, page: p, sort_by: "popularity.desc" });
      } else if (mode === "genre") {
        const gid = GENRE_IDS_BY_NAME[genreName];
        data = await discoverMovies({ with_genres: gid, page: p, sort_by: "popularity.desc" });
      } else if (mode === "new") {
        const days = 90;
        const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const gte = d.toISOString().slice(0, 10);
        data = await discoverMovies({
          'primary_release_date.gte': gte,
          sort_by: "primary_release_date.desc",
          page: p,
        });
      } else {
        data = { results: [], page: 1, total_pages: 0 };
      }
      setResults(data.results || []);
      setPage(data.page || 1);
      setTotalPages(data.total_pages || 0);
      logEvent("tmdb_search", { query, page: p, mode, genre: genreName || undefined });
    } catch (e) {
      console.error(e);
      setErr("Failed to search TMDB. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query, mode, genreName, clearSearch, setLoading, setErr, setResults, setPage, setTotalPages]);

  useEffect(() => {
    if ((mode === "title" || mode === "actor") && query && results.length === 0) runSearch(page);
    if ((mode === "genre" || mode === "new") && results.length === 0) runSearch(page);
  }, [mode, query, results.length, page, runSearch]);

  const hasMore = useMemo(() => totalPages > page, [totalPages, page]);

  function burstAtEvent(e, msg) {
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      if (typeof window !== "undefined" && typeof window.__gearBurst === "function") {
        window.__gearBurst(x, y, { msg });
      }
    } catch (_) { /* noop */ }
  }

  // Actions from results
  function addFavorite(m) {
    setFavorites((prev) => {
      if (prev.some((f) => String(f.id) === String(m.id))) return prev;
      const entry = {
        id: m.id,
        title: m.title,
        poster_path: m.poster_path,
        release_date: m.release_date,
        vote_average: m.vote_average,
        status: "to-watch",
      };
      return [...prev, entry];
    });
  }
  function addToStreamList(m) {
    const key = String(m?.title || "").trim().toLowerCase().replace(/\s+/g, " ");
    const exists = items.some((i) => String(i.title || "").trim().toLowerCase().replace(/\s+/g, " ") === key);
    if (exists) return;
    // Map TMDB genre_ids → first known genre name (fallback to empty)
    const gid = Array.isArray(m?.genre_ids) && m.genre_ids.length ? m.genre_ids[0] : null;
    const genre = gid != null && Object.prototype.hasOwnProperty.call(GENRE_NAMES, gid)
      ? GENRE_NAMES[gid]
      : "";
    dispatch({ type: "ADD", title: m.title, genre });
  }
  function removeFavorite(id) {
    setFavorites(prev => prev.filter(f => String(f.id) !== String(id)));
  }

  // Favorites selection helpers + batch remove
  const favSelectedCount = useMemo(() => Object.values(favSelected).filter(Boolean).length, [favSelected]);
  const isFavSelected = useCallback((id) => !!favSelected[String(id)], [favSelected]);
  const toggleFavSelected = useCallback((id) => {
    setFavSelected(prev => ({ ...prev, [String(id)]: !prev[String(id)] }));
  }, []);
  const clearFavSelection = useCallback(() => setFavSelected({}), []);
  function removeSelectedFavorites() {
    const ids = new Set(Object.keys(favSelected).filter(k => favSelected[k]));
    if (ids.size === 0) return;
    setFavorites(prev => prev.filter(f => !ids.has(String(f.id))));
    clearFavSelection();
  }

  // Selection helpers
  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);
  const isSelected = useCallback((id) => !!selected[String(id)], [selected]);
  const toggleSelected = useCallback((id) => {
    setSelected(prev => ({ ...prev, [String(id)]: !prev[String(id)] }));
  }, []);
  const clearSelection = useCallback(() => setSelected({}), []);

  // Batch actions
  function addSelectedToTreasures() {
    const ids = new Set(Object.keys(selected).filter(k => selected[k]));
    const picks = results.filter(m => ids.has(String(m.id)));
    picks.forEach(addFavorite);
    clearSelection();
  }
  function addSelectedToCabinet() {
    const ids = new Set(Object.keys(selected).filter(k => selected[k]));
    const picks = results.filter(m => ids.has(String(m.id)));
    picks.forEach(addToStreamList);
    clearSelection();
  }

  // Visual flair: slower, opaque bulldozer that loops when triggered
  const dozerRef = useRef(null);
  const [dozerOn, setDozerOn] = useState(false);

  function startDozerLoop(e) {
    try {
      setDozerOn(true);
      // Also immediately position if available
      const btnRect = e?.currentTarget?.getBoundingClientRect?.();
      if (btnRect && dozerRef.current) {
        Object.assign(dozerRef.current.style, {
          left: `${btnRect.right + 8}px`,
          top: `${btnRect.top + btnRect.height / 2 - 18}px`,
        });
      }
    } catch (_) { /* noop */ }
  }

  function handleAddToCabinet(e) {
    startDozerLoop(e); // trigger looping bulldozer
    addSelectedToCabinet();
  }

  // Create a single bulldozer that loops indefinitely once triggered
  const btnRef = useRef(null);
  useEffect(() => {
    if (!dozerOn) return;
    const btn = btnRef.current;
    if (!btn) return;

    const ensureDozer = () => {
      const rect = btn.getBoundingClientRect();
      let img = dozerRef.current;
      if (!img) {
        img = document.createElement("img");
        img.src = bulldozerGif;
        img.alt = "";
        img.className = "vehicle-sprite";
        Object.assign(img.style, {
          position: "fixed",
          width: "36px",
          height: "36px",
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: 2147483647,
          // Slower, fully opaque, continuous loop
          animation: "drive-right-loop 12000ms linear infinite",
        });
        document.body.appendChild(img);
        dozerRef.current = img;
      }
      Object.assign(img.style, {
        left: `${rect.right + 8}px`,
        top: `${rect.top + rect.height / 2 - 18}px`,
      });
    };

    // Initial place and then keep it aligned on scroll/resize
    ensureDozer();
    const onVisChange = () => ensureDozer();
    window.addEventListener("scroll", onVisChange, { passive: true });
    window.addEventListener("resize", onVisChange);

    return () => {
      window.removeEventListener("scroll", onVisChange);
      window.removeEventListener("resize", onVisChange);
      if (dozerRef.current) {
        dozerRef.current.remove();
        dozerRef.current = null;
      }
    };
  }, [dozerOn]);

  return (
    <section className="page ledger-page">
      <div className="container-1120">
        <h1 className="title page-heading--nav" style={{ marginTop: 0, marginBottom: 12 }}>
          <span className="material-icons title-icon">local_movies</span>
          {VOCAB.navGazette}
        </h1>

        {/* Search row — standalone like StreamList */}
        <div className="row-movies">
          <form
            className="form form-movies"
            onSubmit={(e) => { e.preventDefault(); runSearch(1); }}
          >
            <select
              className="input"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              aria-label="Search mode"
              style={{ flex: "0 0 auto" }}
            >
              <option value="title">Title</option>
              <option value="actor">Actor</option>
              <option value="genre">Genre</option>
              <option value="new">New Releases</option>
            </select>

            {(mode === "title" || mode === "actor") && (
              <input
                className="input search-input"
                placeholder={mode === "actor" ? "Search by actor name…" : `${VOCAB.search}…`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            )}

            {mode === "genre" && (
              <select
                className="input"
                value={genreName}
                onChange={(e) => setGenreName(e.target.value)}
                aria-label="Select genre"
              >
                <option value="">Select genre…</option>
                {Object.values(GENRE_NAMES).map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}

            <button
              className="btn"
              type="submit"
              disabled={loading}
              aria-label={VOCAB.search}
              onClick={(e) => burstAtEvent(e, "Summoning…")}
            >
              {loading ? "Summoning…" : VOCAB.search}
            </button>
          </form>
          {(mode === "title" || mode === "actor") && query && (
            <div className="clear-right">
              <button className="btn" type="button" onClick={clearSearch}>Clear</button>
            </div>
          )}
        </div>

        {/* Actions directly under the search row */}
        <div className="below-search-actions">
          <button
            type="button"
            className="btn"
            onClick={addSelectedToTreasures}
            disabled={selectedCount === 0}
            title="Add selected to Treasured Films"
          >
            <img src={letterGif} alt="" className="shimmer-icon" style={{ width: 44, height: 44, objectFit: "contain", marginRight: 6 }} />
            Add to Treasured Films
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleAddToCabinet}
            disabled={selectedCount === 0}
            title="Add selected to Cabinet"
            ref={btnRef}
          >
            <img src={heartGif} alt="" className="shimmer-icon" style={{ width: 44, height: 44, objectFit: "contain", marginRight: 6 }} />
            Add to Cabinet
          </button>
          <span className="muted" aria-live="polite">{selectedCount} selected</span>
        </div>

        {err && <p className="muted">{err}</p>}

        {/* Old batch action bar removed; now placed above */}

        {/* Results + Favorites column */}
        <div className="movies-grid" role="region" aria-label="Search results and Treasured list">
          {/* Results grid — poster (clickable), title, year */}
          <ul className="list movie-results" aria-live="polite">
            {results.map((m) => (
              <li key={m.id} className={"movie-result" + (isSelected(m.id) ? " movie-result--selected" : "") }>
                <label className="select-toggle">
                  <input
                    type="checkbox"
                    checked={isSelected(m.id)}
                    onChange={() => toggleSelected(m.id)}
                    aria-label={`Select ${m.title}`}
                  />
                  <span className="select-box" aria-hidden="true" />
                </label>
                <Link
                  to={`/movie/${m.id}`}
                  className="poster-link"
                  title={`Open ${m.title}`}
                  aria-label={`Open ${m.title}`}
                  onClick={(e) => burstAtEvent(e, "Opening…")}
                >
                  {m.poster_path ? (
                    <img
                      src={posterUrl(m.poster_path, "w154")}
                      alt={m.title}
                      loading="lazy"
                      className="poster-thumb"
                    />
                  ) : (
                    <div style={{
                      width: 154,
                      height: 231,
                      borderRadius: 10,
                      display: "grid",
                      placeItems: "center",
                      color: "rgba(44, 35, 25, .55)",
                      border: "1px dashed rgba(121,85,58,.35)"
                    }}>
                      <span className="material-icons">image_not_supported</span>
                    </div>
                  )}
                </Link>
                <div className="movie-caption">
                  <div className="movie-title">{m.title}</div>
                  <div className="muted">{m.release_date ? m.release_date.slice(0, 4) : "—"}</div>
                  {/* Per-tile quick buttons removed in favor of batch actions */}
                </div>
              </li>
            ))}
          </ul>

          {/* Favorites column: toolbar separated from sidebar box */}
          <div className="favorites-col">
            <div className="favorites-toolbar">
              <button
                type="button"
                className="btn-clean"
                onClick={removeSelectedFavorites}
                disabled={favSelectedCount === 0}
                title="Remove selected from treasures"
                aria-label="Remove selected from treasures"
              >
                <img src={keyImg} alt="" style={{ width: 44, height: 44, objectFit: "contain" }} />
                Remove
              </button>
              <span className="muted" aria-live="polite">{favSelectedCount} selected</span>
            </div>

            {/* Accessible Treasured list on the right */}
            <aside className="favorites-aside" aria-labelledby="fav-heading">
              <h2 id="fav-heading" className="section-title" style={{marginTop:0}}>
                <img src={dinoGif} alt="" className="fav-dino" />
                Treasured Films
              </h2>
              {favorites.length === 0 ? (
                <p className="empty" aria-live="polite">No treasures yet.</p>
              ) : (
                <ul className="favorite-mini-list" role="list">
                  {favorites.map(f => (
                    <li key={f.id} className="favorite-mini-item">
                      <label className="select-toggle" style={{ marginRight: 6 }}>
                        <input
                          type="checkbox"
                          checked={isFavSelected(f.id)}
                          onChange={() => toggleFavSelected(f.id)}
                          aria-label={`Select ${f.title} for removal`}
                        />
                        <span className="select-box" aria-hidden="true" />
                      </label>
                      <Link to={`/movie/${f.id}`} className="favorite-mini-link">
                        {f.poster_path ? (
                          <img src={posterUrl(f.poster_path, "w92")} alt="" className="favorite-mini-thumb" />
                        ) : (
                          <div className="favorite-mini-thumb placeholder" aria-hidden="true" />
                        )}
                        <span className="favorite-mini-title">{f.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        </div>

        {hasMore && (
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
            <button className="btn" onClick={() => runSearch(page + 1)}>
              Load more
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
