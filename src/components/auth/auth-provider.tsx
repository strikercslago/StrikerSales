"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) { setLoading(false); return; }
    const client = getSupabaseClient();
    void client.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setLoading(false); });
    return () => listener.subscription.unsubscribe();
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message === "Invalid login credentials" ? "E-mail ou senha inválidos." : error.message);
    if (!data.session) throw new Error("A sessão não foi criada. Tente entrar novamente.");
    setSession(data.session);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(() => ({ configured, loading, session, user: session?.user ?? null, signIn, signOut }), [configured, loading, session, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth precisa estar dentro de AuthProvider.");
  return value;
}
