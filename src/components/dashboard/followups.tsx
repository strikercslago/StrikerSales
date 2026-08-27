import type { Lead } from "@/types/lead";

export function Followups({ leads, onSelect }: { leads: Lead[]; onSelect: (id: string) => void }) {
  const now = new Date().toISOString();
  const pending = leads.filter((lead) => lead.followupAt && lead.followupAt <= now && lead.status !== "fechado" && !lead.deletedAt).sort((a, b) => a.followupAt!.localeCompare(b.followupAt!));
  if (!pending.length) return null;
  return <section className="followups">
    <div className="section-heading"><div><p className="eyebrow">PRÓXIMOS PASSOS</p><h2>Follow-ups pendentes</h2></div><span className="count-pill">{pending.length}</span></div>
    <div className="followup-row">{pending.slice(0, 4).map((lead) => <button key={lead.id} onClick={() => onSelect(lead.id)}>
      <span><strong>{lead.name}</strong><small>{lead.businessName || lead.segment || "Contato"}</small></span>
      <time className={lead.followupAt! < now ? "overdue" : ""}>{new Date(lead.followupAt!).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</time>
    </button>)}</div>
  </section>;
}
