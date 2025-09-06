import "../app/theme-steampunk.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMovie, posterUrl } from "@services/tmdb";
import useLocalStorage from "../hooks/useLocalStorage";
import { usePersistentList } from "../hooks/usePersistentList";
import { logEvent } from "../utils/eventLogger";

// Steampunk UI helpers
import TVTrailer from "@features/video/TVTrailer";
import AddToFavoritesButton from "@features/lists/AddToFavoritesButton";

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [err, setErr] = useState("");
  const [favorites, setFavorites] = useLocalStorage("streamlist:tmdb:favorites", []);
  const { items, dispatch } = usePersistentList();

  const isFav = useMemo(
    () => favorites.some((f) => String(f.id) === String(id)),
    [favorites, id]
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await getMovie(id);
        setMovie(data);
        logEvent("tmdb_view_detail", { movieId: data.id, title: data.title });
      } catch (e) {
        console.error(e);
        setErr("Failed to fetch movie details.");
      }
    })();
  }, [id]);

  function toggleFavorite() {
    setFavorites((prev) => {
      const exists = prev.some((m) => String(m.id) === String(id));
      if (exists) return prev.filter((m) => String(m.id) !== String(id));
      if (!movie) return prev;
      const entry = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        status: "to-watch",
      };
      return [...prev, entry];
    });
    logEvent(isFav ? "favorite_remove" : "favorite_add", { movieId: id, title: movie?.title });
  }

  function addToCabinet() {
    if (!movie) return false;
    const genre = movie?.genres?.[0]?.name || "";
    const key = String(movie?.title || "").trim().toLowerCase().replace(/\s+/g, " ");
    const exists = items.some((i) => String(i.title || "").trim().toLowerCase().replace(/\s+/g, " ") === key);
    if (exists) return false; // signal duplicate to button for proper messaging
    dispatch({ type: "ADD", title: movie.title, genre });
    logEvent("tmdb_add_to_streamlist", { movieId: id, title: movie.title, genre });
    return true;
  }

  const trailerKey =
    movie?.videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube")?.key || "";

  if (err) return <section className="page ledger-page"><p>{err}</p></section>;
  if (!movie) return <section className="page ledger-page"><p>Loading…</p></section>;

  const year = movie.release_date?.slice(0, 4) || "—";
  const rating = typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : "—";
  const imdbId = movie?.external_ids?.imdb_id;
  const imdbUrl = imdbId ? `https://www.imdb.com/title/${imdbId}/` : "";
  const genres = (movie.genres || []).map((g) => g.name).join(", ") || "—";
  const companies = (movie.production_companies || []).map((c) => c.name).slice(0,3).join(", ") || "—";
  const countries = (movie.production_countries || []).map((c) => c.name).join(", ") || "—";

  return (
    <section className="page ledger-page playbill-bg">
      <div className="container-1120">
      {/* Top toolbar */}
      <div className="toolbar" style={{ marginBottom: 8 }}>
        <Link to="/movies" className="btn btn-ghost">← Return to Gazette</Link>
      </div>

      {/* Playbill Header */}
      <header className="playbill-header" aria-label="Victorian Playbill Header">
        <div className="playbill-title-row">
          <h1 className="playbill-heading title-engrave">{movie.title}</h1>
        </div>
        <div className="ornate-divider" aria-hidden="true" />
        {movie.tagline ? (
          <p className="playbill-subtitle">“{movie.tagline}”</p>
        ) : null}
      </header>

      {/* Content: Poster + Details */}
      <div className="playbill-grid">
        {/* Left: Poster only */}
        <aside className="poster-panel brass-panel">
          {movie.poster_path ? (
            <img
              className="poster-large"
              src={posterUrl(movie.poster_path, "w500")}
              alt={movie.title}
              loading="lazy"
            />
          ) : null}
          {/* No button bar or icon strip under poster per request */}
        </aside>

        {/* Right: Details + Trailer */}
        <main className="details-panel brass-panel">
          <div className="meta-row">
            <span>{year}</span>
            <span>{movie.runtime ? `${movie.runtime} min` : "—"}</span>
            <span>{movie.status || "—"}</span>
            <span>TMDB: {rating}</span>
            {imdbUrl && (
              <a href={imdbUrl} target="_blank" rel="noreferrer" className="link">IMDb</a>
            )}
          </div>

          <div className="meta-row">
            <span>Genres: {genres}</span>
          </div>
          <div className="meta-row">
            <span>Companies: {companies}</span>
          </div>
          <div className="meta-row">
            <span>Countries: {countries}</span>
          </div>

          <p className="overview">{movie.overview || "No overview available."}</p>

          <div className="trailer-cast-row">
            <section className="trailer" aria-label="Excerpts">
              <h2 className="section-title">Excerpts</h2>
              <div className="tv-holder-compact">
                <TVTrailer youtubeKey={trailerKey} showStatus={false} />
              </div>
            </section>

            {movie.credits?.cast?.length ? (
              <section className="cast" aria-label="Provenance">
                <h2 className="section-title">Provenance</h2>
                <ul className="cast-grid">
                  {movie.credits.cast.slice(0, 12).map((c) => (
                    <li className="cast-card" key={c.cast_id || `${c.id}-${c.credit_id}`}>
                      <strong className="text-primary">{c.name}</strong>
                      <span className="muted">{c.character || "—"}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </main>
      </div>
      </div>
    </section>
  );
}
