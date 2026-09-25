"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Modal } from "@/components/ui/modal";
import { LeadsIcon, ProjectsIcon } from "@/components/ui/icons";

export function GlobalNavigation({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [error, setError] = useState<string>();
  const isProjects = pathname.startsWith("/projects");
  return <header className="global-nav">
    <Link className="global-brand" href="/" aria-label="Striker, início"><span className="brand-mark">S</span><span><strong>STRIKER</strong><small>Sistema interno</small></span></Link>
    <nav aria-label="Módulos Striker">
      <Link className={!isProjects ? "active" : ""} href="/" aria-current={!isProjects ? "page" : undefined}><LeadsIcon /><span>Leads</span><small>Prospecção</small></Link>
      <Link className={isProjects ? "active" : ""} href="/projects" aria-current={isProjects ? "page" : undefined}><ProjectsIcon /><span>Projetos</span><small>Projetos de Sites</small></Link>
    </nav>
    <div className="global-account"><span>{userEmail}</span><button type="button" aria-haspopup="dialog" onClick={() => setAccountOpen(true)}>Minha conta</button></div>
    <Modal open={accountOpen} onClose={() => setAccountOpen(false)} label="Minha conta">
      <section className="modal account-sheet"><header><h2>Minha conta</h2><button className="icon-button" aria-label="Fechar conta" onClick={() => setAccountOpen(false)}>×</button></header><p className="account-email">{userEmail}</p>
        {error && <p className="error-box" role="alert">{error}</p>}
        <footer><button className="secondary-button" onClick={() => setAccountOpen(false)}>Voltar</button><button className="danger-button" onClick={() => void signOut().catch(() => setError("Não foi possível sair. Tente novamente."))}>Sair da conta</button></footer>
      </section>
    </Modal>
  </header>;
}
