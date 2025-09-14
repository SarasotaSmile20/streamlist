import React from "react";
import "../app/theme-steampunk.css";
import gears from "../assets/gears.gif";

export default function GearsLoader({ show = false }) {
  if (!show) return null;
  return (
    <div
      className="gears-loader"
      role="status"
      aria-label="Loading, please wait"
    >
      <img src={gears} alt="Spinning gears loading animation" />
    </div>
  );
}
