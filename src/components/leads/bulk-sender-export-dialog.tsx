"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { CloseIcon } from "@/components/ui/icons";
import { buildBulkSenderCandidates, choosePhoneConflict, fingerprintBulkSenderDraft } from "@/lib/bulk-sender/batch";
import { BULK_SENDER_PROFILE, BULK_SENDER_PROFILE_NOTICE } from "@/lib/bulk-sender/profile";
import { buildBulkSenderWorkbook, bulkSenderFileName, downloadWorkbook } from "@/lib/bulk-sender/xlsx";
import type { Lead } from "@/types/lead";
import type { BulkSenderCandidate, BulkSenderExportRecord, BulkSenderExportSnapshot, BulkSenderPurpose, BulkSenderSaveResult } from "@/types/bulk-sender";

export function BulkSenderExportDialog({ open, leads, busy, onClose, onLoadExports, onSaveExport, onResolveValidation }: {
  open: boolean; leads: Lead[]; busy?: boolean; onClose: () => void;
  onLoadExports: () => Promise<BulkSenderExportSnapshot[]>;
  onSaveExport: (record: BulkSenderExportRecord) => Promise<BulkSenderSaveResult>;
  onResolveValidation: (leadId: string) => Promise<Lead>;
}) {
  const [purpose, setPurpose] = useState<BulkSenderPurpose>("initial");
  const [batchName, setBatchName] = useState(`Lote Bulk Sender ${new Date().toLocaleDateString("pt-BR")}`);
  const [campaign, setCampaign] = useState("");
  const [exports, setExports] = useState<BulkSenderExportSnapshot[]>([]);
  const [candidates, setCandidates] = useState<BulkSenderCandidate[]>([]);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [removed, setRemoved] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  useEffect(() => {
    let active = true; setLoading(true);
    void onLoadExports().then((value) => { if (active) setExports(value); }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar os lotes anteriores."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [onLoadExports]);
  useEffect(() => { setCandidates(buildBulkSenderCandidates(leads, purpose, exports)); setMessages({}); setRemoved([]); setNotice(undefined); }, [exports, leads, purpose]);

  const rows = useMemo(() => candidates.filter((item) => item.eligible && !removed.includes(item.leadId)).map((item) => ({ leadId: item.leadId, leadName: item.leadName, originalPhone: item.originalPhone, normalizedPhone: item.normalizedPhone!, message: messages[item.leadId] ?? item.message })), [candidates, messages, removed]);
  const exclusions = useMemo(() => candidates.filter((item) => !item.eligible || removed.includes(item.leadId)).map((item) => ({ leadId: item.leadId, leadName: item.leadName, reason: removed.includes(item.leadId) ? "Removido manualmente deste lote." : item.reason ?? "Não elegível." })), [candidates, removed]);
  const relatedExports = exports.filter((batch) => batch.rows.some((row) => leads.some((lead) => lead.id === row.leadId)));

  const prepare = async () => {
    if (!rows.length) return;
    setGenerating(true); setError(undefined); setNotice(undefined);
    try {
      const draft = { batchName: batchName.trim() || "Lote Bulk Sender", campaign: campaign.trim() || undefined, purpose, rows, exclusions };
      const fingerprint = await fingerprintBulkSenderDraft(draft);
      const record: BulkSenderExportRecord = { ...draft, fingerprint, ...BULK_SENDER_PROFILE };
      const preview = { ...record, id: "preview", createdAt: new Date().toISOString() } satisfies BulkSenderExportSnapshot;
      const buffer = await buildBulkSenderWorkbook(preview);
      const saved = await onSaveExport(record);
      downloadWorkbook(saved.created ? buffer : await buildBulkSenderWorkbook(saved.snapshot), bulkSenderFileName(saved.snapshot.campaign));
      setExports((current) => current.some((item) => item.id === saved.snapshot.id) ? current : [saved.snapshot, ...current]);
      setNotice(saved.created ? "Lote preparado e registrado. Isso não confirma envio, entrega ou leitura." : "Este lote já existia. A cópia original foi baixada novamente sem duplicar o registro.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível gerar o XLSX."); }
    finally { setGenerating(false); }
  };
  const redownload = async (snapshot: BulkSenderExportSnapshot) => {
    setGenerating(true); setError(undefined);
    try { downloadWorkbook(await buildBulkSenderWorkbook(snapshot), bulkSenderFileName(snapshot.campaign, new Date(snapshot.createdAt))); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível baixar o lote."); }
    finally { setGenerating(false); }
  };
  const resolveValidation = async (leadId: string) => {
    try { await onResolveValidation(leadId); setNotice("Validação resolvida. O contato será reavaliado no lote."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível resolver a validação."); }
  };

  return <Modal open={open} label="Exportar para Bulk Sender" onClose={onClose} busy={busy || generating}>
    <section className="modal bulk-sender-modal" aria-labelledby="bulk-sender-title">
      <header><div className="bulk-title"><span className="bulk-sender-logo" aria-hidden="true">Bulk<br />Send</span><div><p className="eyebrow">LOTE DE MENSAGENS</p><h2 id="bulk-sender-title">Exportar para Bulk Sender</h2></div></div><button className="icon-button" aria-label="Fechar" disabled={busy || generating} onClick={onClose}><CloseIcon /></button></header>
      <p className="bulk-profile-notice">{BULK_SENDER_PROFILE_NOTICE}</p>
      <div className="bulk-sender-form">
        <label><span>Nome do lote</span><input value={batchName} onChange={(event) => setBatchName(event.target.value)} /></label>
        <label><span>Campanha</span><input value={campaign} placeholder="Ex.: Clínicas de Passo Fundo" onChange={(event) => setCampaign(event.target.value)} /></label>
      </div>
      <fieldset className="bulk-purpose"><legend>Finalidade única do lote</legend><label><input type="radio" name="bulk-purpose" checked={purpose === "initial"} onChange={() => setPurpose("initial")} /> Primeira abordagem</label><label><input type="radio" name="bulk-purpose" checked={purpose === "followup"} onChange={() => setPurpose("followup")} /> Acompanhamento</label></fieldset>
      <div className="preview-stats bulk-stats"><div><strong>{leads.length}</strong><span>selecionados</span></div><div className="positive"><strong>{rows.length}</strong><span>elegíveis</span></div><div className={exclusions.length ? "warning" : ""}><strong>{exclusions.length}</strong><span>excluídos</span></div><div><strong>{candidates.filter((item) => item.previouslyExported).length}</strong><span>já exportados</span></div></div>
      {loading ? <p className="review-safety-note">Carregando histórico de lotes...</p> : <div className="bulk-contact-list">
        {candidates.filter((item) => item.eligible && !removed.includes(item.leadId)).map((item) => <article key={item.leadId} className="bulk-contact"><div><strong>{item.leadName}</strong><span>{item.normalizedPhone}</span>{item.previouslyExported && <small>Já apareceu em exportação anterior</small>}</div><button onClick={() => setRemoved((current) => [...current, item.leadId])}>Remover</button><textarea aria-label={`Mensagem de ${item.leadName}`} value={messages[item.leadId] ?? item.message} onChange={(event) => setMessages((current) => ({ ...current, [item.leadId]: event.target.value }))} /></article>)}
      </div>}
      {exclusions.length > 0 && <details className="bulk-exclusions" open><summary>Excluídos e pendências ({exclusions.length})</summary><div>{candidates.filter((item) => !item.eligible || removed.includes(item.leadId)).map((item) => <article key={item.leadId}><span><strong>{item.leadName}</strong><small>{removed.includes(item.leadId) ? "Removido manualmente deste lote." : item.reason}</small></span><div>{removed.includes(item.leadId) && <button onClick={() => setRemoved((current) => current.filter((id) => id !== item.leadId))}>Recolocar</button>}{item.reason === "Validação pendente." && <button disabled={busy} onClick={() => void resolveValidation(item.leadId)}>Resolver validação</button>}{item.conflictLeadIds && <button onClick={() => setCandidates((current) => choosePhoneConflict(current, item.leadId))}>Usar este contato</button>}</div></article>)}</div></details>}
      {relatedExports.length > 0 && <details className="bulk-history"><summary>Exportações anteriores ({relatedExports.length})</summary><div>{relatedExports.map((item) => <article key={item.id}><span><strong>{item.batchName}</strong><small>{new Date(item.createdAt).toLocaleString("pt-BR")} · {item.rows.length} contatos</small></span><button disabled={generating} onClick={() => void redownload(item)}>Baixar novamente</button></article>)}</div></details>}
      {error && <p className="error-box" role="alert">{error}</p>}{notice && <p className="migration-success" role="status">{notice}</p>}
      <footer><button className="secondary-button" disabled={generating} onClick={onClose}>Fechar</button><button className="primary-button" disabled={loading || generating || busy || !rows.length || rows.some((row) => !row.message.trim())} onClick={() => void prepare()}>{generating ? "Gerando XLSX..." : `Baixar XLSX (${rows.length})`}</button></footer>
    </section>
  </Modal>;
}
