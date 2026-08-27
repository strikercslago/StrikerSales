import type { Lead, LeadStatus } from "@/types/lead";

const metrics: { label: string; status?: LeadStatus; className?: string }[] = [
  { label: "Leads totais" }, { label: "Novos", status: "novo", className: "accent" },
  { label: "Abordados", status: "abordado" }, { label: "Responderam", status: "respondeu" },
  { label: "Interessados", status: "interessado", className: "positive" },
  { label: "Follow-ups", status: "followup" },
  { label: "Propostas", status: "proposta", className: "warning" },
  { label: "Fechados", status: "fechado", className: "positive" },
];

export function MetricsGrid({ leads }: { leads: Lead[] }) {
  return <section className="metrics-grid" aria-label="Resumo do funil">
    {metrics.map((metric) => <article className={`metric-card ${metric.className ?? ""}`} key={metric.label}>
      <span>{metric.label}</span>
      <strong>{metric.status ? leads.filter((lead) => lead.status === metric.status).length : leads.length}</strong>
    </article>)}
  </section>;
}
