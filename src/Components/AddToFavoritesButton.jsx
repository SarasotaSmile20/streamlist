import React from "react";
import { useAirship } from "./AirshipProvider";
import "./theme-steampunk.css";

export default function AddToFavoritesButton({
  movie, onAdd,
  label = <><i className="fa-solid fa-star" /> Add to Wax-Sealed</>,
  message = "Added to Wax-Sealed",
  className = "btn"
}) {
  const { launch } = useAirship();
  const handleClick = () => { try { onAdd?.(movie); launch(message); } catch { launch("Failed to add"); } };
  return <button className={className} onClick={handleClick}>{label}</button>;
}
