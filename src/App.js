import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import StreamList from "./Components/StreamList";
import Movies from "./Components/Movies";
import Cart from "./Components/Cart";
import About from "./Components/About";
import Watchlist from "./Components/Watchlist";
import MovieDetail from "./Components/MovieDetail";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-wrap">
        <Routes>
          <Route path="/" element={<StreamList />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} EZTechMovie • StreamList
      </footer>
    </div>
  );
}
