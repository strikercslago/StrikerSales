"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const wallpaperRef = useRef<HTMLVideoElement>(null);
  const [wallpaperPaused, setWallpaperPaused] = useState(false);
  const { configured, loading, user, signIn } = useAuth();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState<string>(); const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (user) router.replace("/"); }, [router, user]);
  useEffect(() => {
    if (loading) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (preference.matches) {
        wallpaperRef.current?.pause();
        setWallpaperPaused(true);
      } else {
        void wallpaperRef.current?.play().then(() => setWallpaperPaused(false)).catch(() => setWallpaperPaused(true));
      }
    };
    syncPlayback();
    preference.addEventListener("change", syncPlayback);
    return () => preference.removeEventListener("change", syncPlayback);
  }, [loading]);
  const toggleWallpaper = () => {
    if (wallpaperPaused) {
      void wallpaperRef.current?.play().then(() => setWallpaperPaused(false)).catch(() => setWallpaperPaused(true));
    } else {
      wallpaperRef.current?.pause();
      setWallpaperPaused(true);
    }
  };
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(undefined); setSubmitting(true); try { await signIn(email, password); router.replace("/"); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível entrar."); } finally { setSubmitting(false); } };
  if (loading) return <div className="loading-screen"><div className="brand-mark">S</div></div>;
  return <main className="login-screen"><div className="login-wallpaper" aria-hidden="true"><video ref={wallpaperRef} className="login-wallpaper-video" src="/media/login-wallpaper.mp4" muted loop playsInline preload="auto" tabIndex={-1} /></div><button type="button" className="wallpaper-toggle" onClick={toggleWallpaper}>{wallpaperPaused ? "Reproduzir fundo" : "Pausar fundo"}</button><section className="login-card"><div className="brand login-brand"><div className="brand-mark">S</div><div><strong>STRIKER <span>SALES</span></strong><p>Prospecção</p></div></div><div className="login-copy"><p className="eyebrow">ACESSO INTERNO</p><h1>Bem-vindo de volta</h1><p>Entre com suas credenciais para acessar sua central comercial.</p></div>{!configured ? <p className="error-box">Supabase ainda não foi configurado neste ambiente.</p> : <form onSubmit={submit}><label>E-mail<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" /></label><label>Senha<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" /></label>{error && <p className="error-box">{error}</p>}<button className="primary-button" disabled={submitting}>{submitting ? "Entrando..." : "Entrar"}</button></form>}<small>Acesso restrito à equipe autorizada.</small></section></main>;
}
