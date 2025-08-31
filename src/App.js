// src/App.js
import "./index.css";                      // Tailwind base
import "./App.css";                        // App-wide styles (landing, navbar)
import "./Components/theme-steampunk.css"; // Theme (after Tailwind)

import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Landing (login)
import CurtainLogin from "./Components/CurtainLogin";
import Register from "./Components/Register";

// Top-level pages
import StreamList from "./Components/StreamList";
import Movies from "./Components/Movies";
import MovieDetail from "./Components/MovieDetail";
import TVTrailer from "./Components/TVTrailer";
import Watchlist from "./Components/Watchlist";
import Cart from "./Components/Cart";
import About from "./Components/About";

// Layout for post-login pages
import AppLayout from "./layouts/AppLayout";

function RequireAuth() {
  const authed = !!localStorage.getItem("sl_user");
  return authed ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Landing = Login */}
      <Route path="/" element={<CurtainLogin />} />
      <Route path="/register" element={<Register />} />

      {/* Protected area */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/streamlist" element={<StreamList />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/trailer/:id" element={<TVTrailer />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
