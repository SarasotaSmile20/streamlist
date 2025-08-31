import { useMemo } from "react";
import { Link } from "react-router-dom";
import useLocalStorage from "@hooks/useLocalStorage";
import { posterUrl } from "@services/tmdb";
import { usePersistentList } from "@hooks/usePersistentList";
import { VOCAB } from "@utils/vocabulary";
import { logEvent } from "@utils/eventLogger";

export default function Watchlist() {
  const [favorites, setFavorites] = useLocalStorage("streamlist:tmdb:favorites", []);
  const { items, dispatch } = usePersistentList();

  const hasItems = favorites.length > 0;
  const watchedCount = useMemo(() => favorites.filter(f => f.status === "watched").length, [favorites]);

  function toggleStatus(id) {
    setFavorites(prev => prev.map(f => f.id === id ? { ...f, status: f.status === "watched" ? "to-watch" : "watched" } : f));
  }
  function removeFav(id) {
    setFavorites(prev => prev.filter(f => f.id !== id));
    logEvent("favorite_remove", { movieId: id });
  }
  function addToStreamList(item) {
    const key = String(item?.title || "").trim().toLowerCase().replace(/\s+/g, " ");
    const exists = items.some((i) => String(i.title || "").trim().toLowerCase().replace(/\s+/g, " ") === key);
    if (exists) {
      alert(`Already in Cabinet: ${item.title}`);
      return;
    }
    dispatch({ type: "ADD", title: item.title, genre: "" });
    logEvent("tmdb_add_to_streamlist", { movieId: item.id, title: item.title });
    alert(`Added to Cabinet: ${item.title}`);
  }

  return (
    <section className="page">
      <h1 className="title">
        <span className="material-icons title-icon">bookmark</span>
        Cabinet of Curiosities
      </h1>

      <div className="hint" style={{ marginBottom: 8 }}>
        {hasItems
          ? <>You have <strong>{favorites.length}</strong> saved • <strong>{watchedCount}</strong> watched</>
          : <span className="muted">Your cabinet is empty. Add some from the <Link to="/movies" className="link">{VOCAB.search}</Link> page.</span>
        }
      </div>

      {!hasItems ? null : (
        <ul className="list">
          {favorites.map(f => (
            <li className="card" key={f.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12 }}>
              <img
                src={posterUrl(f.poster_path, "w154")}
                alt={f.title}
                style={{ width: 100, height: 150, objectFit: "cover", borderRadius: 10, background: "#0b1222" }}
                loading="lazy"
              />
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <strong style={{ fontSize: "1rem" }}>
                    <Link to={`/movies/${f.id}`} className="link">{f.title}</Link>
                  </strong>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn" onClick={() => toggleStatus(f.id)}>
                      {f.status === "watched" ? "Mark To-Watch" : "Mark Watched"}
                    </button>
                    <button className="icon-btn" onClick={() => addToStreamList(f)} title={VOCAB.addToList} aria-label={VOCAB.addToList}>
                      <span className="material-icons">playlist_add</span>
                    </button>
                    <button className="icon-btn" onClick={() => removeFav(f.id)} title="Remove from Cabinet">
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </div>
                <div className="muted" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>Year: {f.release_date?.slice(0, 4) || "—"}</span>
                  <span>Rating: {typeof f.vote_average === "number" ? f.vote_average.toFixed(1) : "—"}</span>
                  <span>Status: {f.status === "watched" ? "Watched" : "To-Watch"}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
