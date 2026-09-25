"use client";

import { useState } from "react";
import type { LeadStatus } from "@/types/lead";
import { SearchIcon } from "@/components/ui/icons";

export type StatusFilter = "todos" | LeadStatus;
const options: { value: StatusFilter; label: string }[] = [
  { value: "novo", label: "Novos" }, { value: "abordado", label: "Abordados" },
  { value: "respondeu", label: "Responderam" }, { value: "interessado", label: "Interessados" },
  { value: "followup", label: "Follow-up" }, { value: "proposta", label: "Propostas" },
  { value: "fechado", label: "Fechados" }, { value: "sem_interesse", label: "Sem interesse" },
  { value: "possui_fornecedor", label: "Possui fornecedor" }, { value: "todos", label: "Todos" },
];

export function Filters({ status, segment, priority, query, segments, onStatus, onSegment, onPriority, onQuery }: { status: StatusFilter; segment: string; priority: string; query: string; segments: string[]; onStatus: (value: StatusFilter) => void; onSegment: (value: string) => void; onPriority: (value: string) => void; onQuery: (value: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const count = Number(Boolean(segment)) + Number(Boolean(priority));
  return <div className={`filters${expanded ? " filters-expanded" : ""}`}>
    <div className="filter-search-row"><label className="search-field"><SearchIcon /><input type="search" aria-label="Buscar leads" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Nome, empresa ou telefone" /></label>
      <button className="secondary-button filter-toggle" aria-expanded={expanded} aria-controls="advanced-lead-filters" onClick={() => setExpanded(!expanded)}>Filtros{count ? ` (${count})` : ""}</button>
    </div>
    <div className="filter-status-row"><label className="mobile-status-filter">Etapa<select value={status} onChange={(event) => onStatus(event.target.value as StatusFilter)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <div className="filter-tabs" aria-label="Etapa dos leads">{options.map((option) => <button aria-pressed={status === option.value} className={status === option.value ? "active" : ""} key={option.value} onClick={() => onStatus(option.value)}>{option.label}</button>)}</div>
    </div>
    <div id="advanced-lead-filters" className="filter-fields">
      <label>Segmento<select value={segment} onChange={(event) => onSegment(event.target.value)}><option value="">Todos os segmentos</option>{segments.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Prioridade<select value={priority} onChange={(event) => onPriority(event.target.value)}><option value="">Todas as prioridades</option><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></select></label>
      {count > 0 && <button className="secondary-button" onClick={() => { onSegment(""); onPriority(""); }}>Limpar filtros</button>}
    </div>
  </div>;
}
