"use client";

import { useRef, useState } from "react";
import { UploadIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/modal";

export function AppHeader({ deletedCount, onNewLead, onImport, onExport, onRestore, onDeleted, onMigrate }: { deletedCount: number; onNewLead: () => void; onImport: () => void; onExport: () => void; onRestore: (file: File) => Promise<unknown>; onDeleted: () => void; onMigrate: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [notice, setNotice] = useState<string>();
  const restoreRef = useRef<HTMLInputElement>(null);
  const run = (action: () => void) => { setMenuOpen(false); action(); };
  const restore = async (file?: File) => {
    if (!file) return;
    setRestoring(true);
    try { await onRestore(file); setNotice("Backup restaurado com sucesso."); setMenuOpen(false); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível restaurar o backup."); }
    finally { setRestoring(false); if (restoreRef.current) restoreRef.current.value = ""; }
  };
  return <header className="app-header sales-toolbar">
    <div className="brand"><div><strong>STRIKER <span>SALES</span></strong><p>Central de prospecção</p></div></div>
    <div className="header-actions">
      <button className="secondary-button desktop-import" onClick={onImport}><UploadIcon /> Importar</button>
      <button className="primary-button" onClick={onNewLead}>+ Novo lead</button>
      <button className="secondary-button" aria-haspopup="dialog" onClick={() => { setNotice(undefined); setMenuOpen(true); }}>Mais</button>
    </div>
    <Modal open={menuOpen} onClose={() => setMenuOpen(false)} label="Ferramentas de leads" busy={restoring}>
      <section className="modal action-sheet"><header><div><p className="eyebrow">ORGANIZAR SUA BASE</p><h2>Ferramentas de leads</h2></div><button className="icon-button" aria-label="Fechar ferramentas" disabled={restoring} onClick={() => setMenuOpen(false)}>×</button></header>
        <div className="action-sheet-list">
          <button disabled={restoring} onClick={() => run(onImport)}><strong>Importar leads</strong><span>Adicionar contatos de um arquivo JSON</span></button>
          <button disabled={restoring} onClick={() => run(onDeleted)}><strong>Excluídos ({deletedCount})</strong><span>Consultar e restaurar contatos</span></button>
          <button disabled={restoring} onClick={() => run(onExport)}><strong>Exportar backup</strong><span>Salvar uma cópia dos seus dados</span></button>
          <button disabled={restoring} onClick={() => restoreRef.current?.click()}><strong>{restoring ? "Restaurando..." : "Restaurar backup"}</strong><span>Mesclar os dados de um backup existente</span></button>
          <button disabled={restoring} onClick={() => run(onMigrate)}><strong>Migrar dados locais</strong><span>Recuperar dados salvos neste navegador</span></button>
        </div>
        <input ref={restoreRef} hidden type="file" accept=".json,application/json" onChange={(event) => void restore(event.target.files?.[0])} />
        {notice && <p role="status" className="notice">{notice}</p>}
      </section>
    </Modal>
    {notice && !menuOpen && <div className="toast" role="status">{notice}<button aria-label="Fechar aviso" onClick={() => setNotice(undefined)}>×</button></div>}
  </header>;
}
