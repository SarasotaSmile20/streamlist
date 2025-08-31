import React from "react";
import "./theme-steampunk.css";
import gears from "../assets/gears.gif";

export default function GearsLoader({ show = false }) {
  if (!show) return null;
  return (
    <div className="gears-loader">
      <img src={gears} alt="Loading..." />
    </div>
  );
}
