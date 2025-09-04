import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovie, posterUrl } from "@services/tmdb";
import useLocalStorage from "../hooks/useLocalStorage";
import { usePersistentList } from "../hooks/usePersistentList";
import { logEvent } from "../utils/eventLogger";

// steampunk components
import TVTrailer from "@features/video/TVTrailer";
import AddToFavoritesButton from "@features/lists/AddToFavoritesButton";
// Removed watchlist button usage

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
      if (exists) {
        return prev.filter((m) => String(m.id) !== String(id));
      }
      const f = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        status: "to-watch",
      };
      return [...prev, f];
    });
    logEvent(isFav ? "favorite_remove" : "favorite_add", { movieId: id, title: movie?.title });
  }

  function addToStreamList() {
    const genre = movie?.genres?.[0]?.name || "";
    const key = String(movie?.title || "").trim().toLowerCase().replace(/\s+/g, " ");
    const exists = items.some((i) => String(i.title || "").trim().toLowerCase().replace(/\s+/g, " ") === key);
    if (exists) {
      return false; // signal duplicate to button for proper messaging
    }
    dispatch({ type: "ADD", title: movie.title, genre });
    logEvent("tmdb_add_to_streamlist", { movieId: id, title: movie.title, genre });
    return true;
  }

  // Find a YouTube trailer key if present
  const trailerKey =
    movie?.videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube")
      ?.key || "";

  if (err) return <section className="page"><p>{err}</p></section>;
  if (!movie) return <section className="page"><p>Loading…</p></section>;

  const GearIcon = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ opacity: 0.8 }}
    >
      <path
        d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm9 4.5-.02-.34-2.13-.77c-.12-.38-.28-.75-.48-1.09l1.07-1.93-.24-.26-1.49-1.49-.26-.24-1.93 1.07c-.34-.2-.71-.36-1.09-.48l-.77-2.13L13 3h-2l-.34.02-.77 2.13c-.38.12-.75.28-1.09.48L6.87 4.56l-.26.24L5.12 6.3l-.24.26 1.07 1.93c-.2.34-.36.71-.48 1.09l-2.13.77L3 12v2l.02.34 2.13.77c.12.38.28.75.48 1.09L4.56 18.13l.24.26 1.49 1.49.26.24 1.93-1.07c.34.2.71.36 1.09.48l.77 2.13L11 21h2l.34-.02.77-2.13c.38-.12.75-.28 1.09-.48l1.93 1.07.26-.24 1.49-1.49.24-.26-1.07-1.93c.2-.34.36-.71.48-1.09l2.13-.77L21 14v-2Z"
        fill="rgba(237,239,243,.7)"
      />
    </svg>
  );

  return (
    <section className="page">
      <div className="toolbar" style={{ marginBottom: 8 }}>
        <Link to="/movies" className="btn">← Back to Summons</Link>
        {/* Removed watchlist link */}
      </div>

      {/* Dossier */}
      <h2 className="section-title" aria-label="Dossier"><GearIcon /> Dossier</h2>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
        {movie.poster_path && (
          <img
            src={posterUrl(movie.poster_path, "w342")}
            alt={movie.title}
            style={{ width: 220, borderRadius: 12, background: "#0b1222" }}
            loading="lazy"
          />
        )}
        <div style={{ display: "grid", gap: 8 }}>
          <h1 className="title" style={{ margin: 0 }}>{movie.title}</h1>
          <div className="muted" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span>{movie.release_date?.slice(0,4) || "—"}</span>
            <span>{movie.runtime ? `${movie.runtime} min` : "—"}</span>
            <span>{movie.status || "—"}</span>
            <span>
              Rating: {typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : "—"}
            </span>
          </div>
          {movie.tagline ? <p className="muted" style={{ fontStyle: "italic" }}>{movie.tagline}</p> : null}
          <p>{movie.overview || "No overview available."}</p>

          {/* Removed action buttons under poster */}
        </div>
      </div>

      {/* Excerpts — embedded trailer in TV frame */}
      <section style={{ marginTop: 16 }} aria-label="Excerpts">
        <h2 className="section-title"><GearIcon /> Excerpts</h2>
        <div className="tv-holder-compact">
          <TVTrailer youtubeKey={trailerKey} />
        </div>
      </section>

      {movie.credits?.cast?.length ? (
        <section className="cast-section" aria-label="Provenance">
          <h2 className="section-title"><GearIcon /> Provenance</h2>
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
    </section>
  );
}
