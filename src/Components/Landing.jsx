// src/Components/Landing.jsx
import React from "react";
import "../app/theme-steampunk.css";

export default function Landing({ onStart }) {
  return (
    <section className="stage-bg">
      <div className="stage-content" style={{ padding: "2rem 1rem", textAlign: "center" }}>
        <h1 className="landing-title" style={{ marginBottom: ".5rem" }}>
          EZTechMovie • StreamList
        </h1>
        <p style={{ opacity: .9, marginBottom: "1rem" }}>
          Find it. Watch it. Love it.
        </p>
        <div style={{ display: "flex", gap: ".6rem", justifyContent: "center" }}>
          <button className="btn" onClick={onStart}>Enter</button>
          <a href="/movies" className="btn btn-ghost">Browse Movies</a>
        </div>
      </div>
    </section>
  );
}
