"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";

export function GlobalNavigation({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const isProjects = pathname.startsWith("/projects");

  return <header className="global-nav">
    <Link className="global-brand" href={isProjects ? "/projects" : "/"} aria-label="Striker">
      <span className="brand-mark">S</span><span><strong>STRIKER</strong><small>Sistema interno</small></span>
    </Link>
    <button className="global-menu-button" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>Menu</button>
    <nav className={open ? "open" : ""} aria-label="Módulos Striker">
      <Link className={!isProjects ? "active" : ""} href="/" onClick={() => setOpen(false)}><span>Sales</span><small>Prospecção</small></Link>
      <Link className={isProjects ? "active" : ""} href="/projects" onClick={() => setOpen(false)}><span>Projetos de Sites</span><small>Project System</small></Link>
    </nav>
    <div className="global-account"><span>{userEmail}</span><button type="button" onClick={() => void signOut()}>Sair</button></div>
  </header>;
}
