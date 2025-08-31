import React from "react";
import "@app/theme-steampunk.css";
import tv from "../../assets/tv.gif";

export default function TVTrailer({ youtubeKey, videoSrc }) {
  return (
    <div className="tv-frame">
      <img src={tv} alt="Vintage TV" />
      <div className="tv-screen">
        {youtubeKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=0&controls=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Trailer"
          />
        ) : videoSrc ? (
          <video src={videoSrc} controls playsInline />
        ) : (
          <div style={{color:"#cfc",display:"grid",placeItems:"center",height:"100%"}}>
            No trailer available
          </div>
        )}
      </div>
    </div>
  );
}
