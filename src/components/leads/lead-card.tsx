import type { Lead } from "@/types/lead";
import { ArrowIcon } from "@/components/ui/icons";

export function LeadCard({ lead, selected, onSelect, onSkip }: { lead: Lead; selected: boolean; onSelect: () => void; onSkip: () => void }) {
  const approachedTime = lead.approachedAt ? new Date(lead.approachedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : undefined;
  return <article className={`lead-card ${lead.status === "abordado" ? "approached" : ""} ${selected ? "selected" : ""}`}>
    <button className="card-main" onClick={onSelect}>
      <div className="lead-card-top"><span className={`priority ${lead.priority}`}>{lead.priority}</span><span className="score">{lead.score ?? "—"} <small>SCORE</small></span></div>
      <h3>{lead.name}</h3><p className="lead-meta">{[lead.segment, lead.city].filter(Boolean).join(" · ") || "Sem classificação"}</p>
      <p className="pain-summary">{lead.pain || "Nenhuma dor comercial registrada."}</p>
      <div className="card-bottom"><span>★ {lead.rating ?? "—"} <small>({lead.reviewCount ?? 0} avaliações)</small></span><span className={`status ${lead.status}`}>{lead.status.replace("_", " ")}</span></div>
      {lead.status === "abordado" && approachedTime && <p className="approached-time">Enviado às {approachedTime}</p>}
    </button>
    <div className="card-actions"><button onClick={onSelect}>Abordar <ArrowIcon /></button><button onClick={onSelect}>Analisar</button><button onClick={onSkip}>Pular</button></div>
  </article>;
}
