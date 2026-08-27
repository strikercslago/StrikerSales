"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "./auth-provider";

export function ProtectedApp() {
  const router = useRouter();
  const { configured, loading, user } = useAuth();
  useEffect(() => { if (configured && !loading && !user) router.replace("/login"); }, [configured, loading, router, user]);
  if (!configured) return <main className="setup-screen"><div className="brand-mark">S</div><p className="eyebrow">CONFIGURAÇÃO NECESSÁRIA</p><h1>Conecte o Supabase</h1><p>Crie o arquivo <code>.env.local</code> a partir de <code>.env.local.example</code> e informe a URL e a chave pública do projeto.</p></main>;
  if (loading || !user) return <div className="loading-screen"><div className="brand-mark">S</div><p>Verificando sessão...</p></div>;
  return <AppShell />;
}
