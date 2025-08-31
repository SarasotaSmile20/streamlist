import React from "react";
import { useAirship } from "../../Components/AirshipProvider";
import "app/theme-steampunk.css";

export default function AddToWatchlistButton({
  movie, onAdd,
  label = <><i className="fa-solid fa-list-check" /> Add to Cabinet</>,
  message = "Added to Cabinet",
  className = "btn"
}) {
  const { launch } = useAirship();
  const handleClick = () => { try { onAdd?.(movie); launch(message); } catch { launch("Failed to add"); } };
  return <button className={className} onClick={handleClick}>{label}</button>;
}
