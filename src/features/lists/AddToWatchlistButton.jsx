import React from "react";
import { useAirship } from "../../Components/AirshipProvider";
import { VOCAB } from "../../utils/vocabulary";
import "app/theme-steampunk.css";

export default function AddToWatchlistButton({
  movie, onAdd,
  label,
  message = "Added to Cabinet",
  duplicateMessage = "Already in Cabinet",
  className = "btn",
  ariaLabel
}) {
  const { launch } = useAirship();
  const handleClick = () => {
    try {
      const result = onAdd?.(movie);
      // Treat explicit false as duplicate/no-op
      if (result === false) {
        launch(duplicateMessage);
        return;
      }
      launch(message);
    } catch {
      launch("Failed to add");
    }
  };
  const content = label ?? (
    <>
      <i className="fa-solid fa-list-check" aria-hidden="true" /> {VOCAB.addToList}
    </>
  );
  const computedAria = ariaLabel ?? VOCAB.addToList;
  return (
    <button className={className} onClick={handleClick} aria-label={computedAria}>
      {content}
    </button>
  );
}
