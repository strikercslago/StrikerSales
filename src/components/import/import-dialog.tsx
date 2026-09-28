"use client";

import { Modal } from "@/components/ui/modal";

import { useRef, useState } from "react";
import type { Lead } from "@/types/lead";
import type { LeadImportResult } from "@/types/lead-import";
import { validateLeadBatch } from "@/lib/leads/validation";
import { CloseIcon, UploadIcon } from "@/components/ui/icons";

export function ImportDialog({ open, existing, importing, onClose, onImport }: { open: boolean; existing: Lead[]; importing?: boolean; onClose: () => void; onImport: (result: LeadImportResult) => Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<LeadImportResult>();
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string>();
  const [approvedPossibleIds, setApprovedPossibleIds] = useState<string[]>([]);

  if (!open) return null;
  const read = async (file?: File) => {
    if (!file) return;
    setFileName(file.name); setError(undefined); setResult(undefined); setApprovedPossibleIds([]);
    try { setResult(validateLeadBatch(JSON.parse(await file.text()), existing)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível ler o arquivo."); }
  };
  const finish = async () => { if (!result) return; const approved = new Set(approvedPossibleIds); const reviewed = { ...result, newLeads: [...result.newLeads, ...result.possibleDuplicates.filter((lead) => approved.has(lead.id))], possibleDuplicates: result.possibleDuplicates.filter((lead) => !approved.has(lead.id)) }; try { await onImport(reviewed); setResult(undefined); setFileName(""); setApprovedPossibleIds([]); onClose(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível importar."); } };
  return <Modal open={open} label="Importar leads" onClose={onClose} busy={importing}>
    <section className="modal" aria-labelledby="import-title">
      <header><div><p className="eyebrow">ENTRADA DE DADOS</p><h2 id="import-title">Importar lote de leads</h2></div><button className="icon-button" aria-label="Fechar" disabled={importing} onClick={onClose}><CloseIcon /></button></header>
      {!result && <button className="dropzone" onClick={() => inputRef.current?.click()}><UploadIcon /><strong>Selecione um arquivo JSON</strong><span>Compatível com o schema striker-leads 1.0</span><input ref={inputRef} type="file" accept=".json,application/json" hidden onChange={(event) => void read(event.target.files?.[0])} /></button>}
      {fileName && <p className="selected-file">Arquivo: <strong>{fileName}</strong></p>}
      {error && <p className="error-box">{error}</p>}
      {result && <div className="import-preview">
        <div className="preview-stats"><div><strong>{result.found}</strong><span>encontrados</span></div><div className="positive"><strong>{result.newLeads.length}</strong><span>novos</span></div><div className="warning"><strong>{result.duplicates.length}</strong><span>duplicados</span></div><div className="warning"><strong>{result.possibleDuplicates.length}</strong><span>para revisar</span></div><div><strong>{result.rejectedCandidates.length}</strong><span>rejeitados</span></div><div className={result.errors.length ? "danger" : ""}><strong>{result.errors.length}</strong><span>erros</span></div></div>
        {result.duplicates.length > 0 && <p className="notice">Empresas já conhecidas, inclusive na lixeira, não serão importadas novamente.</p>}
        {result.possibleDuplicates.length > 0 && <details className="possible-duplicates"><summary>Revisar possíveis duplicatas</summary><p>Marque somente quando confirmar que é outra empresa ou filial válida.</p><ul>{result.possibleDuplicates.map((lead) => <li key={lead.id}><label><input type="checkbox" checked={approvedPossibleIds.includes(lead.id)} disabled={importing} onChange={(event) => setApprovedPossibleIds((current) => event.target.checked ? [...current, lead.id] : current.filter((id) => id !== lead.id))} /><span><strong>{lead.businessName || lead.name}</strong><small>{[lead.city, lead.state, lead.website || lead.instagram].filter(Boolean).join(" · ")}</small></span></label></li>)}</ul></details>}
        {result.errors.length > 0 && <details><summary>Ver erros</summary><ul>{result.errors.map((item) => <li key={item.index}>Lead {item.index + 1}: {item.message}</li>)}</ul></details>}
      </div>}
      <footer><button className="secondary-button" disabled={importing} onClick={onClose}>Cancelar</button>{result && <button className="primary-button" disabled={(!result.newLeads.length && !approvedPossibleIds.length) || importing} onClick={() => void finish()}>{importing ? "Importando..." : `Importar ${result.newLeads.length + approvedPossibleIds.length} leads`}</button>}</footer>
    </section>
  </Modal>;
}
