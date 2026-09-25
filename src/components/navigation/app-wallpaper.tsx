"use client";

import { useEffect, useRef, useState } from "react";

export function AppWallpaper() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 900px)");
    const syncPlayback = () => {
      if (preference.matches) {
        video.pause();
        video.removeAttribute("src");
        video.load();
        setPaused(true);
      } else {
        video.src = "/media/app-wallpaper.mp4";
        void video.play().catch(() => setPaused(true));
      }
    };
    syncPlayback();
    preference.addEventListener("change", syncPlayback);
    return () => preference.removeEventListener("change", syncPlayback);
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      if (!video.getAttribute("src")) video.src = "/media/app-wallpaper.mp4";
      void video.play().catch(() => setPaused(true));
    }
    else video.pause();
  };

  return <>
    <div className="app-wallpaper" aria-hidden="true">
      <video
        ref={videoRef}
        className="app-wallpaper-video"
        muted
        loop
        playsInline
        preload="none"
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
