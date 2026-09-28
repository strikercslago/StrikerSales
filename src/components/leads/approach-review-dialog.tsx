"use client";

import { useMemo, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { CloseIcon, UploadIcon } from "@/components/ui/icons";
import { buildApproachReviewPackage, isReviewEligible, previewApproachReviews, validateApproachReviewResult } from "@/lib/leads/approach-review";
import type { Lead } from "@/types/lead";
import type { ApproachReviewItem, ApproachReviewResult } from "@/types/approach-review";

function downloadPackage(leads: Lead[]) {
  const value = buildApproachReviewPackage(leads);
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = `striker-revisar-abordagens-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ApproachReviewDialog({ open, leads, applying, onClose, onApply }: { open: boolean; leads: Lead[]; applying?: boolean; onClose: () => void; onApply: (reviews: ApproachReviewItem[]) => Promise<{ updated: number; skipped: number }> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ApproachReviewResult>();
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const eligible = useMemo(() => leads.filter(isReviewEligible), [leads]);
  const preview = useMemo(() => result ? previewApproachReviews(result, leads) : [], [leads, result]);
  const applicable = preview.filter((item) => item.state === "applicable");
  const skipped = preview.filter((item) => item.state !== "applicable");

  const read = async (file?: File) => {
    if (!file) return;
    setFileName(file.name); setError(undefined); setSuccess(undefined); setResult(undefined);
    try { setResult(validateApproachReviewResult(JSON.parse(await file.text()))); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível ler o arquivo."); }
  };
  const apply = async () => {
    setError(undefined);
    try {
      const report = await onApply(applicable);
      setSuccess(`${report.updated} abordagens atualizadas${report.skipped ? ` e ${report.skipped} ignoradas porque mudaram durante a aplicação` : ""}.`);
      setResult(undefined); setFileName("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível aplicar as revisões."); }
  };

  return <Modal open={open} label="Revisar abordagens" onClose={onClose} busy={applying}>
    <section className="modal approach-review-modal" aria-labelledby="approach-review-title">
      <header><div><p className="eyebrow">QUALIDADE DAS MENSAGENS</p><h2 id="approach-review-title">Revisar abordagens</h2></div><button className="icon-button" aria-label="Fechar" disabled={applying} onClick={onClose}><CloseIcon /></button></header>
      <div className="approach-review-flow"><span>1. Exportar</span><span>2. Revisar no ChatGPT</span><span>3. Importar e conferir</span></div>
      {!result && <div className="approach-review-intro">
        <div className="review-count"><strong>{eligible.length}</strong><span>leads novos e ainda não abordados</span></div>
        <p>O arquivo contém as mensagens e o contexto comercial necessário, sem telefone ou anotações privadas. Envie-o ao ChatGPT e peça para seguir as instruções incluídas no próprio arquivo.</p>
        <button className="primary-button" disabled={!eligible.length || applying} onClick={() => downloadPackage(leads)}>Exportar para revisão</button>
        <button className="dropzone compact" disabled={applying} onClick={() => inputRef.current?.click()}><UploadIcon /><strong>Importar arquivo corrigido</strong><span>Resultado striker-approach-review-result 1.0</span><input ref={inputRef} type="file" accept=".json,application/json" hidden onChange={(event) => void read(event.target.files?.[0])} /></button>
      </div>}
      {fileName && <p className="selected-file">Arquivo: <strong>{fileName}</strong></p>}
      {error && <p className="error-box" role="alert">{error}</p>}
      {success && <p className="migration-success" role="status">{success}</p>}
      {result && <div className="approach-review-preview">
        <div className="preview-stats"><div><strong>{result.reviews.length}</strong><span>recebidas</span></div><div className="positive"><strong>{applicable.length}</strong><span>prontas</span></div><div className="warning"><strong>{skipped.length}</strong><span>protegidas</span></div><div className={result.errors.length ? "danger" : ""}><strong>{result.errors.length}</strong><span>inválidas</span></div></div>
        <p className="review-safety-note">Somente leads que continuam novos, não abordados e sem alterações após a exportação serão atualizados.</p>
        <div className="review-diffs">{preview.map((item) => <details key={item.leadId} className={item.state}><summary><span><strong>{item.leadName}</strong><small>{item.state === "applicable" ? "Pronta para aplicar" : item.reason}</small></span><b>{item.state === "applicable" ? "Revisar" : "Protegida"}</b></summary>{item.state === "applicable" && <div className="review-diff-grid"><div><span>Antes</span><p>{item.currentMessage}</p>{item.currentFollowupMessage && <small>Follow-up: {item.currentFollowupMessage}</small>}</div><div><span>Depois</span><p>{item.message}</p>{item.followupMessage && <small>Follow-up: {item.followupMessage}</small>}</div>{item.rationale && <em>{item.rationale}</em>}</div>}</details>)}</div>
        {result.errors.length > 0 && <details className="review-errors"><summary>Ver registros inválidos</summary><ul>{result.errors.map((item) => <li key={item.index}>Item {item.index + 1}: {item.message}</li>)}</ul></details>}
      </div>}
      <footer><button className="secondary-button" disabled={applying} onClick={result ? () => { setResult(undefined); setFileName(""); } : onClose}>{result ? "Voltar" : "Fechar"}</button>{result && <button className="primary-button" disabled={!applicable.length || applying} onClick={() => void apply()}>{applying ? "Aplicando..." : `Aplicar ${applicable.length} revisões`}</button>}</footer>
    </section>
  </Modal>;
}
