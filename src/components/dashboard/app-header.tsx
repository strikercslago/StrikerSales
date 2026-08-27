"use client";

import { useRef, useState } from "react";
import { BackupIcon, UploadIcon } from "@/components/ui/icons";

export function AppHeader({ userEmail, deletedCount, onNewLead, onImport, onExport, onRestore, onDeleted, onMigrate, onLogout }: { userEmail?: string; deletedCount: number; onNewLead: () => void; onImport: () => void; onExport: () => void; onRestore: (file: File) => Promise<unknown>; onDeleted: () => void; onMigrate: () => void; onLogout: () => Promise<void> }) {
  const [backupOpen, setBackupOpen] = useState(false);
  const [notice, setNotice] = useState<string>();
  const restoreRef = useRef<HTMLInputElement>(null);
  const restore = async (file?: File) => {
    if (!file) return;
    try { await onRestore(file); setNotice("Backup restaurado com sucesso."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível restaurar o backup."); }
    setBackupOpen(false); window.setTimeout(() => setNotice(undefined), 3500);
  };
  return <header className="app-header">
    <div className="brand"><div className="brand-mark">S</div><div><strong>STRIKER <span>SALES</span></strong><p>Prospecção</p></div></div>
    <div className="header-actions"><button className="secondary-button header-compact" onClick={onDeleted}>Excluídos{deletedCount ? ` (${deletedCount})` : ""}</button><div className="backup-menu"><button className="secondary-button" onClick={() => setBackupOpen(!backupOpen)}><BackupIcon /> Backup</button>{backupOpen && <div className="backup-popover"><strong>Dados e segurança</strong><p>Exporte, restaure ou migre o armazenamento local.</p><button onClick={() => { onExport(); setBackupOpen(false); }}>Exportar backup</button><button onClick={() => restoreRef.current?.click()}>Restaurar backup</button><button onClick={() => { onMigrate(); setBackupOpen(false); }}>Migrar dados locais</button><hr /><small>{userEmail}</small><button onClick={() => void onLogout()}>Sair</button><input ref={restoreRef} hidden type="file" accept=".json,application/json" onChange={(event) => void restore(event.target.files?.[0])} /></div>}</div>
      <button className="secondary-button import-button" onClick={onImport}><UploadIcon /> Importar</button><button className="primary-button" onClick={onNewLead}>+ Novo Lead</button></div>
    {notice && <div className="toast">{notice}</div>}
  </header>;
}
