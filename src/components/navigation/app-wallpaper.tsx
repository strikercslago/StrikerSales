"use client";

import { useEffect, useRef, useState } from "react";

export function AppWallpaper() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (preference.matches) video.pause();
      else void video.play().catch(() => setPaused(true));
    };
    syncPlayback();
    preference.addEventListener("change", syncPlayback);
    return () => preference.removeEventListener("change", syncPlayback);
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setPaused(true));
    else video.pause();
  };

  return <>
    <div className="app-wallpaper" aria-hidden="true">
      <video
        ref={videoRef}
        className="app-wallpaper-video"
        src="/media/app-wallpaper.mp4"
        muted
        loop
        playsInline
        preload="auto"
        tabIndex={-1}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      />
    </div>
    <button className="app-wallpaper-toggle" type="button" onClick={togglePlayback}>
      {paused ? "Reproduzir fundo" : "Pausar fundo"}
    </button>
  </>;
}
