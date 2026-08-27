import type { Lead } from "@/types/lead";
import { LeadCard } from "./lead-card";

export function ProspectingQueue({ leads, selectedId, onSelect }: { leads: Lead[]; selectedId?: string; onSelect: (id: string) => void }) {
  return <section className="queue-section">
    <div className="section-heading"><div><p className="eyebrow">FILA PRIORIZADA</p><h2>Prospecção</h2></div><span className="count-pill">{leads.length} leads</span></div>
    {leads.length ? <div className="queue-list">{leads.map((lead, index) => <LeadCard key={lead.id} lead={lead} selected={lead.id === selectedId} onSelect={() => onSelect(lead.id)} onSkip={() => onSelect(leads[index + 1]?.id ?? leads[0]?.id)} />)}</div>
      : <div className="empty-queue"><span>✓</span><h3>Fila em dia</h3><p>Nenhum lead corresponde aos filtros atuais.</p></div>}
  </section>;
}
