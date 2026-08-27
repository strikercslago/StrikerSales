import type { LeadStatus } from "@/types/lead";
import { SearchIcon } from "@/components/ui/icons";

export type StatusFilter = "todos" | LeadStatus;
const options: { value: StatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" }, { value: "novo", label: "Novos" }, { value: "abordado", label: "Abordados" },
  { value: "respondeu", label: "Responderam" }, { value: "interessado", label: "Interessados" },
  { value: "followup", label: "Follow-up" }, { value: "proposta", label: "Propostas" }, { value: "fechado", label: "Fechados" },
];

export function Filters({ status, segment, priority, query, segments, onStatus, onSegment, onPriority, onQuery }: { status: StatusFilter; segment: string; priority: string; query: string; segments: string[]; onStatus: (value: StatusFilter) => void; onSegment: (value: string) => void; onPriority: (value: string) => void; onQuery: (value: string) => void }) {
  return <div className="filters">
    <div className="filter-tabs">{options.map((option) => <button className={status === option.value ? "active" : ""} key={option.value} onClick={() => onStatus(option.value)}>{option.label}</button>)}</div>
    <div className="filter-fields"><label className="search-field"><SearchIcon /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Buscar nome, empresa ou telefone" /></label>
      <select value={segment} onChange={(event) => onSegment(event.target.value)} aria-label="Filtrar por segmento"><option value="">Todos os segmentos</option>{segments.map((item) => <option key={item}>{item}</option>)}</select><select value={priority} onChange={(event) => onPriority(event.target.value)} aria-label="Filtrar por prioridade"><option value="">Todas prioridades</option><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></select></div>
  </div>;
}
