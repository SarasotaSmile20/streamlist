import React from "react";
import { useAirship } from "../../Components/AirshipProvider";
import { VOCAB } from "../../utils/vocabulary";
import "app/theme-steampunk.css";

export default function AddToFavoritesButton({
  movie, onAdd,
  label,
  message = "Added to Wax-Sealed",
  className = "btn btn-wax",
  ariaLabel
}) {
  const { launch } = useAirship();
  const handleClick = () => { try { onAdd?.(movie); launch(message); } catch { launch("Failed to add"); } };
  const content = label ?? (
    <>
      <span className="wax-seal" aria-hidden="true" />
      {VOCAB.markFavorite ?? "Mark with Wax Seal"}
    </>
  );
  const computedAria = ariaLabel ?? (VOCAB.markFavorite ?? "Mark with Wax Seal");
  return (
    <button className={className} onClick={handleClick} aria-label={computedAria}>
      {content}
    </button>
  );
}
