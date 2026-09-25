"use client";

import { Modal } from "@/components/ui/modal";

import { useEffect, useState } from "react";
import type { CrmSnapshot } from "@/types/lead";
import type { MigrationPreview, MigrationReport } from "@/types/repository";
import { CloseIcon } from "@/components/ui/icons";

export function LocalMigrationDialog({ open, busy, onClose, onPreview, onMigrate }: { open: boolean; busy: boolean; onClose: () => void; onPreview: () => Promise<{ snapshot: CrmSnapshot; preview: MigrationPreview }>; onMigrate: (snapshot: CrmSnapshot) => Promise<MigrationReport> }) {
  const [data, setData] = useState<{ snapshot: CrmSnapshot; preview: MigrationPreview }>(); const [report, setReport] = useState<MigrationReport>(); const [error, setError] = useState<string>();
  useEffect(() => { if (!open) return; setData(undefined); setReport(undefined); setError(undefined); void onPreview().then(setData).catch((cause) => setError(cause instanceof Error ? cause.message : "Não foi possível ler os dados locais.")); }, [onPreview, open]);
  if (!open) return null;
  return <Modal open={open} label="Migrar dados locais" onClose={onClose} busy={busy}><section className="modal migration-modal"><header><div><p className="eyebrow">TRANSIÇÃO SEGURA</p><h2>Migrar dados locais</h2></div><button className="icon-button" aria-label="Fechar" disabled={busy} onClick={onClose}><CloseIcon /></button></header>{error && <p className="error-box">{error}</p>}{!data && !error && <p className="modal-loading">Analisando o backup local...</p>}{data && !report && <><div className="preview-stats"><div><strong>{data.preview.found}</strong><span>encontrados</span></div><div className="positive"><strong>{data.preview.newCount}</strong><span>novos</span></div><div className="warning"><strong>{data.preview.duplicateCount}</strong><span>duplicados</span></div><div><strong>{data.preview.deletedDuplicates.length}</strong><span>excluídos encontrados</span></div></div><p className="notice">O armazenamento local não será apagado após a migração.</p></>}{report && <div className="migration-success"><strong>Dados migrados com sucesso.</strong><p>{report.importedCount} leads e {report.historyCount} eventos importados. A meta diária também foi migrada.</p><p>O backup local foi mantido.</p></div>}<footer><button className="secondary-button" disabled={busy} onClick={onClose}>{report ? "Concluir" : "Cancelar"}</button>{data && !report && <button className="primary-button" disabled={busy || !data.preview.newCount} onClick={() => void onMigrate(data.snapshot).then(setReport).catch((cause) => setError(cause instanceof Error ? cause.message : "Falha na migração."))}>{busy ? "Migrando..." : `Migrar ${data.preview.newCount} leads`}</button>}</footer></section></Modal>;
}
