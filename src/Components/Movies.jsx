import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import { searchMovies, posterUrl } from "@services/tmdb";
import { usePersistentList } from "@hooks/usePersistentList";
import { VOCAB } from "@utils/vocabulary";
import { logEvent } from "../utils/eventLogger";
import letterGif from "../assets/Letter.gif";
import clockGif from "../assets/Clock.gif";
import skullGif from "../assets/skull.gif";
import dinoGif from "../assets/dino.gif";
import vehicleGif from "../assets/vehicle.gif";
import raygunGif from "../assets/raygun.gif";

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
    dispatch({ type: "ADD", title: m.title, genre: "" });
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

  // Visual flair: on clicking Add to Cabinet, drive a vehicle gif to the right with steam and fade
  function driveVehicleFromButton(e) {
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const img = document.createElement("img");
      img.src = vehicleGif;
      img.alt = "";
      img.className = "vehicle-sprite";
      Object.assign(img.style, {
        position: "fixed",
        left: `${rect.left + rect.width + 8}px`,
        top: `${rect.top + rect.height / 2 - 18}px`,
        width: "36px",
        height: "36px",
        objectFit: "contain",
        pointerEvents: "none",
        zIndex: 2147483647,
        animation: "drive-right-fade 4500ms cubic-bezier(.2,.8,.2,1) forwards",
      });
      document.body.appendChild(img);
      // Steam puffs
      const puffInterval = setInterval(() => {
        const r = img.getBoundingClientRect();
        const puff = document.createElement("div");
        puff.className = "steam-puff";
        Object.assign(puff.style, {
          left: `${r.left - 6}px`,
          top: `${r.top + r.height / 2}px`,
        });
        document.body.appendChild(puff);
        puff.addEventListener("animationend", () => puff.remove(), { once: true });
      }, 220);
      img.addEventListener("animationend", () => { clearInterval(puffInterval); img.remove(); }, { once: true });
    } catch (_) { /* noop */ }
  }

  function handleAddToCabinet(e) {
    driveVehicleFromButton(e);
    addSelectedToCabinet();
  }

  // Continuous steampunk vehicle animation starting at the right of the Add to Cabinet button
  const btnRef = useRef(null);

  useEffect(() => {
    let timer = null;
    let running = true;

    function spawnOnce() {
      if (!running) return;
      const btn = btnRef.current;
      if (!btn) { timer = setTimeout(spawnOnce, 600); return; }
      const rect = btn.getBoundingClientRect();
      const img = document.createElement("img");
      img.src = vehicleGif;
      img.alt = "";
      img.className = "vehicle-sprite";
      Object.assign(img.style, {
        position: "fixed",
        left: `${rect.right + 8}px`,
        top: `${rect.top + rect.height / 2 - 18}px`,
        width: "36px",
        height: "36px",
        objectFit: "contain",
        pointerEvents: "none",
        zIndex: 2147483647,
        animation: "drive-right-fade 5000ms cubic-bezier(.2,.8,.2,1) forwards",
      });
      document.body.appendChild(img);
      // Steam puffs while driving
      const puffInterval = setInterval(() => {
        const r = img.getBoundingClientRect();
        const puff = document.createElement("div");
        puff.className = "steam-puff";
        Object.assign(puff.style, { left: `${r.left - 6}px`, top: `${r.top + r.height / 2}px` });
        document.body.appendChild(puff);
        puff.addEventListener("animationend", () => puff.remove(), { once: true });
      }, 240);
      img.addEventListener("animationend", () => {
        clearInterval(puffInterval);
        img.remove();
        if (running) timer = setTimeout(spawnOnce, 1800);
      }, { once: true });
    }

    // Kick off loop after mount
    timer = setTimeout(spawnOnce, 1800);

    // Reposition on scroll/resize between loops
    const onVisChange = () => { /* no-op: next spawn reads rect */ };
    window.addEventListener("scroll", onVisChange, { passive: true });
    window.addEventListener("resize", onVisChange);

    return () => {
      running = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener("scroll", onVisChange);
      window.removeEventListener("resize", onVisChange);
    };
  }, []);

  return (
    <section className="page ledger-page">
      <div className="container-1120">
        <h1 className="title font-cinzelDecorative text-primary title-engrave" style={{ marginTop: 0, marginBottom: 12 }}>
          <span className="material-icons title-icon">local_movies</span>
          Movies
        </h1>

        {/* Search row — standalone like StreamList */}
        <div className="row-movies">
          <form
            className="form form-movies"
            onSubmit={(e) => { e.preventDefault(); runSearch(1); }}
          >
            <input
              className="input search-input"
              placeholder={`${VOCAB.search}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
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
          {query && (
            <div className="clear-right">
              <button className="btn" type="button" onClick={clearSearch}>Clear</button>
            </div>
          )}
        </div>

        {err && <p className="muted">{err}</p>}

        {/* Batch action bar (single set of buttons; select tiles first) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, marginBottom: 4 }}>
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
            <img src={raygunGif} alt="" className="shimmer-icon" style={{ width: 44, height: 44, objectFit: "contain", marginRight: 6 }} />
            Add to Cabinet
          </button>
          <span className="muted" aria-live="polite">{selectedCount} selected</span>
        </div>

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
                <img src={skullGif} alt="" style={{ width: 44, height: 44, objectFit: "contain" }} />
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
