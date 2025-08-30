import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovie, posterUrl } from "../utils/tmdb";
import useLocalStorage from "../hooks/useLocalStorage";
import { usePersistentList } from "../hooks/usePersistentList";
import { logEvent } from "../utils/eventLogger";

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [err, setErr] = useState("");
  const [favorites, setFavorites] = useLocalStorage("streamlist:tmdb:favorites", []);
  const { dispatch } = usePersistentList();

  const isFav = favorites.some(f => String(f.id) === String(id));

  useEffect(() => {
    (async () => {
      try {
        const data = await getMovie(id); // includes credits + videos via append_to_response
        setMovie(data);
        logEvent("tmdb_view_detail", { movieId: data.id, title: data.title });
      } catch (e) {
        console.error(e);
        setErr("Failed to fetch movie details.");
      }
    })();
  }, [id]);

  function toggleFavorite() {
    setFavorites(prev => {
      const exists = prev.some(m => String(m.id) === String(id));
      if (exists) {
        return prev.filter(m => String(m.id) !== String(id));
      }
      const f = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        status: "to-watch"
      };
      return [...prev, f];
    });
    logEvent(isFav ? "favorite_remove" : "favorite_add", { movieId: id, title: movie?.title });
  }

  function addToStreamList() {
    const genre = movie.genres?.[0]?.name || "";
    dispatch({ type: "ADD", title: movie.title, genre });
    logEvent("tmdb_add_to_streamlist", { movieId: id, title: movie.title, genre });
    alert(`Added to StreamList: ${movie.title}${genre ? ` (${genre})` : ""}`);
  }

  const trailer = movie?.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube");

  if (err) return <section className="page"><p>{err}</p></section>;
  if (!movie) return <section className="page"><p>Loading…</p></section>;

  return (
    <section className="page">
      <div className="toolbar" style={{ marginBottom: 8 }}>
        <Link to="/movies" className="btn">← Back to Search</Link>
        <Link to="/watchlist" className="btn">Open Watchlist</Link>
      </div>

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
            <span>Rating: {typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : "—"}</span>
          </div>
          {movie.tagline ? <p className="muted" style={{ fontStyle: "italic" }}>{movie.tagline}</p> : null}
          <p>{movie.overview || "No overview available."}</p>

          <div className="toolbar" style={{ gap: 8 }}>
            <button className="btn" onClick={toggleFavorite}>
              {isFav ? "★ Remove Favorite" : "☆ Add Favorite"}
            </button>
            <button className="btn" onClick={addToStreamList}>
              + Add to StreamList
            </button>
            {trailer && (
              <a
                className="btn"
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noreferrer"
              >
                ▶ Watch Trailer
              </a>
            )}
          </div>
        </div>
      </div>

      {movie.credits?.cast?.length ? (
        <section style={{ marginTop: 16 }}>
          <h2 className="title" style={{ fontSize: "1.2rem" }}>Top Cast</h2>
          <ul className="list">
            {movie.credits.cast.slice(0, 8).map(c => (
              <li className="card" key={c.cast_id || `${c.id}-${c.credit_id}`}>
                {c.name} — <span className="muted">{c.character}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
