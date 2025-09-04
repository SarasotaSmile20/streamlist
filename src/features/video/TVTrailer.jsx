import React, { useState, useCallback } from "react";
import "@app/theme-steampunk.css";
import tv from "../../assets/tv.gif";

export default function TVTrailer({ youtubeKey, videoSrc, showStatus = true }) {
  const [status, setStatus] = useState("Crank to Preview");

  const onVideoPlay = useCallback(() => setStatus("Now Exhibiting"), []);
  const onVideoPause = useCallback(() => setStatus("Crank to Preview"), []);
  const onIFrameFocus = useCallback(() => setStatus("Now Exhibiting"), []);
  const onIFrameBlur = useCallback(() => setStatus("Crank to Preview"), []);

  return (
    <div className="tv-frame" aria-label="Trailer player">
      <img src={tv} alt="Vintage TV" />
      <div className="tv-screen" role="group" aria-label="Video area">
        {youtubeKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=0&controls=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Trailer"
            onFocus={onIFrameFocus}
            onBlur={onIFrameBlur}
          />
        ) : videoSrc ? (
          <video
            src={videoSrc}
            controls
            playsInline
            onPlay={onVideoPlay}
            onPause={onVideoPause}
          />
        ) : (
          <div style={{color:"#cfc",display:"grid",placeItems:"center",height:"100%"}}>
            No trailer available
          </div>
        )}
      </div>
      {showStatus && (
        <div className="tv-status" role="status" aria-live="polite">
          {status}
        </div>
      )}
    </div>
  );
}
