"use client";

import { useEffect, useRef, useState } from "react";
import type { Lead, LeadStatus } from "@/types/lead";
import { buildWhatsAppUrl, getWhatsAppPhone } from "@/lib/leads/whatsapp";
import { displayPhone } from "@/lib/leads/normalize-phone";
import { ArrowIcon, CloseIcon, MapIcon, MoreIcon, PhoneIcon } from "@/components/ui/icons";

const statusActions: { status: LeadStatus; label: string }[] = [
  { status: "respondeu", label: "Respondeu" }, { status: "interessado", label: "Interessado" },
  { status: "sem_interesse", label: "Sem interesse" }, { status: "possui_fornecedor", label: "Possui fornecedor" },
  { status: "followup", label: "Follow-up" }, { status: "proposta", label: "Proposta" }, { status: "fechado", label: "Fechado" },
];

export function LeadDetails({ lead, busy, onClose, onEdit, onDelete, onStartApproach, onRevertApproach, onSaveMessage, onStatus, onFollowup }: { lead?: Lead; busy?: boolean; onClose: () => void; onEdit: () => void; onDelete: () => void; onStartApproach: (message: string) => Promise<unknown>; onRevertApproach: () => void; onSaveMessage: (message: string) => Promise<unknown>; onStatus: (status: LeadStatus) => Promise<unknown>; onFollowup: (at?: string) => Promise<unknown> }) {
  const [message, setMessage] = useState(lead?.message ?? "");
  const [tab, setTab] = useState<"details" | "history">("details");
  const [menu, setMenu] = useState(false);
  const [followupAt, setFollowupAt] = useState(lead?.followupAt?.slice(0, 16) ?? "");
  const openingWhatsApp = useRef(false);
  const skipMessageSave = useRef(false);
  useEffect(() => { setMessage(lead?.message ?? ""); setFollowupAt(lead?.followupAt?.slice(0, 16) ?? ""); setTab("details"); }, [lead?.id, lead?.message, lead?.followupAt]);
  if (!lead) return <aside className="detail-panel empty-detail"><div><span>↗</span><h2>Selecione um lead</h2><p>Abra um contato da fila para iniciar a abordagem.</p></div></aside>;
  const whatsappPhone = getWhatsAppPhone(lead.phone, lead.whatsappUrl);
  const whatsappUrl = whatsappPhone ? buildWhatsAppUrl(whatsappPhone, message) : undefined;
  const openWhatsApp = () => {
    if (!whatsappUrl || busy || openingWhatsApp.current) return;
    openingWhatsApp.current = true;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    void onStartApproach(message).catch(() => undefined).finally(() => { openingWhatsApp.current = false; skipMessageSave.current = false; });
  };
  return <aside className="detail-panel">
    <header className="detail-header"><div className="lead-avatar">{lead.name.slice(0, 2).toUpperCase()}</div><div><span className={`status ${lead.status}`}>{lead.status.replace("_", " ")}</span><h2>{lead.name}</h2><p>{lead.businessName || [lead.segment, lead.city].filter(Boolean).join(" · ")}</p></div><div className="detail-header-actions"><button onClick={onEdit}>Editar</button><button className="text-danger" onClick={onDelete}>Excluir</button><button className="icon-button" onClick={onClose}><CloseIcon /></button></div></header>
    <nav className="detail-tabs"><button className={tab === "details" ? "active" : ""} onClick={() => setTab("details")}>Visão geral</button><button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>Histórico <span>{lead.history.length}</span></button></nav>
    {tab === "details" ? <div className="detail-scroll">
      <section className="info-grid"><div><span>Segmento</span><strong>{lead.segment || "—"}</strong></div><div><span>Cidade</span><strong>{[lead.city, lead.state].filter(Boolean).join(" / ") || "—"}</strong></div><div><span>Telefone</span><strong>{displayPhone(lead.phone)}</strong></div><div><span>Avaliação</span><strong>★ {lead.rating ?? "—"} <small>({lead.reviewCount ?? 0})</small></strong></div><div><span>Score</span><strong className="blue">{lead.score ?? "—"}</strong></div><div><span>Prioridade</span><strong className={`priority ${lead.priority}`}>{lead.priority}</strong></div></section>
      {(lead.mapsSearchUrl || lead.contactUrl) && <div className="external-links">{lead.mapsSearchUrl && <a href={lead.mapsSearchUrl} target="_blank" rel="noreferrer"><MapIcon /> Google Maps</a>}{lead.contactUrl && <a href={lead.contactUrl} target="_blank" rel="noreferrer">Abrir contato ↗</a>}</div>}
      <section className="detail-section"><p className="eyebrow">ANÁLISE COMERCIAL</p><div className="analysis-box"><div><span>Dor identificada</span><p>{lead.pain || "Não informada."}</p></div><div><span>Oportunidade</span><p>{lead.opportunity || "Não informada."}</p></div></div></section>
      <section className="detail-section message-section"><div className="section-heading"><div><p className="eyebrow">MENSAGEM</p><h3>Abordagem personalizada</h3></div><span>{message.length} caracteres</span></div><textarea value={message} onChange={(event) => setMessage(event.target.value)} onBlur={() => { if (!skipMessageSave.current && message !== lead.message) void onSaveMessage(message).catch(() => undefined); }} rows={6} />
        <button className="whatsapp-button" disabled={!whatsappUrl || busy} onPointerDown={() => { skipMessageSave.current = true; }} onClick={openWhatsApp}><PhoneIcon /> {whatsappUrl ? "ABRIR WHATSAPP" : "WHATSAPP INDISPONÍVEL"} <ArrowIcon /></button>
        {!whatsappUrl && lead.phone && <a className="phone-fallback" href={`tel:${lead.phone}`}>Ligar para o telefone informado</a>}
        {lead.status === "abordado" && <button className="revert-approach-button" disabled={busy} onClick={onRevertApproach}>Desfazer abordagem</button>}
      </section>
      <section className="detail-section"><p className="eyebrow">FOLLOW-UP</p>{lead.followupMessage && <p className="followup-copy">{lead.followupMessage}</p>}<div className="followup-form"><input type="datetime-local" value={followupAt} onChange={(event) => setFollowupAt(event.target.value)} /><button disabled={!followupAt || busy} onClick={() => void onFollowup(new Date(followupAt).toISOString()).catch(() => undefined)}>Agendar</button>{lead.followupAt && <button className="remove-followup" disabled={busy} onClick={() => { setFollowupAt(""); void onFollowup(undefined).catch(() => undefined); }}>Remover</button>}</div></section>
      <section className="detail-section"><p className="eyebrow">CONTEXTO</p><div className="context-row"><span>Site <strong>{lead.websiteStatus || "não informado"}</strong></span><span>Instagram <strong>{lead.instagramStatus || "não informado"}</strong></span></div>{Object.keys(lead.extra).length > 0 && <details className="extra-data"><summary>Dados adicionais ({Object.keys(lead.extra).length})</summary><pre>{JSON.stringify(lead.extra, null, 2)}</pre></details>}</section>
    </div> : <div className="detail-scroll history-list">{[...lead.history].reverse().map((event) => <article key={event.id}><span className="timeline-dot" /><div><strong>{event.type.replaceAll("_", " ")}</strong><time>{new Date(event.timestamp).toLocaleString("pt-BR")}</time>{event.data && <p>{event.data.to ? `Status: ${String(event.data.from)} → ${String(event.data.to)}` : event.data.message ? "Mensagem registrada" : "Evento registrado"}</p>}</div></article>)}</div>}
    <footer className="quick-actions"><span>Ações rápidas</span><button disabled={busy} onClick={() => void onStatus("respondeu").catch(() => undefined)}>Respondeu</button><button disabled={busy} onClick={() => void onStatus("interessado").catch(() => undefined)}>Interessado</button><div className="more-menu"><button className="icon-button" onClick={() => setMenu(!menu)}><MoreIcon /></button>{menu && <div>{statusActions.slice(2).map((action) => <button key={action.status} onClick={() => { void onStatus(action.status).catch(() => undefined); setMenu(false); }}>{action.label}</button>)}</div>}</div></footer>
  </aside>;
}
