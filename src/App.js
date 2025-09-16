// src/App.js
import "./index.css";                      // Tailwind base
import "./App.css";                        // App-wide styles (landing, navbar)
import "./app/theme-steampunk.css"; // Theme (after Tailwind)

import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";

// Landing (login)
import CurtainLogin from "./Components/CurtainLogin";
import Register from "./features/auth/Register";

// Top-level pages
import StreamList from "./features/lists/StreamList";
import Movies from "./Components/Movies";
import MovieDetail from "./pages/MovieDetail";
import TVTrailer from "./features/video/TVTrailer";
import Cart from "./Components/Cart";
import CreditCard from "./Components/CreditCard";
import About from "./Components/About";
import LoungeChat from "./Components/LoungeChat";

// Layout for post-login pages
import AppLayout from "./app/AppLayout";
import Admin from "./features/admin/Admin";
import { isAdminEmail, getCurrentUserEmail } from "./utils/admin";

function RequireAuth() {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthed(!!u);
      setChecked(true);
    });
    return () => unsub();
  }, []);
  if (!checked) return null; // or a loader
  return authed ? <Outlet /> : <Navigate to="/" replace />;
}

function RequireAdmin() {
  const [checked, setChecked] = useState(false);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      const email = u?.email || getCurrentUserEmail();
      setOk(!!email && isAdminEmail(email));
      setChecked(true);
    });
    return () => unsub();
  }, []);
  if (!checked) return null;
  return ok ? <Outlet /> : <Navigate to="/streamlist" replace />;
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
          {/** Watchlist removed */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<CreditCard />} />
          <Route path="/about" element={<About />} />
          <Route path="/lounge" element={<LoungeChat />} />

          {/* Admin-only */}
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
