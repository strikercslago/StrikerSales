import { useState } from "react";
import type { Lead } from "@/types/lead";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LeadCard } from "./lead-card";

export function ProspectingQueue({ leads, selectedId, onSelect, busy, onDeleteMany }: { leads: Lead[]; selectedId?: string; onSelect: (id: string) => void; busy?: boolean; onDeleteMany: (ids: string[]) => Promise<unknown> }) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState<string[]>([]);
  const selected = leads.filter((lead) => checkedIds.includes(lead.id)).map((lead) => lead.id);
  const allChecked = leads.length > 0 && selected.length === leads.length;
  const toggle = (id: string) => setCheckedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  return <section className="queue-section">
    <div className="section-heading"><div><p className="eyebrow">FILA PRIORIZADA</p><h2>Prospecção</h2></div><span className="count-pill">{leads.length} leads</span></div>
    {leads.length > 0 && <div className="queue-bulk-actions">
      <label><input type="checkbox" checked={allChecked} ref={(element) => { if (element) element.indeterminate = selected.length > 0 && !allChecked; }} disabled={busy} onChange={() => setCheckedIds(allChecked ? [] : leads.map((lead) => lead.id))} /><span>Selecionar todos da fila ({leads.length})</span></label>
      <span role="status" aria-live="polite">{selected.length} selecionados</span>
      {selected.length > 0 && <><button className="secondary-button" disabled={busy} onClick={() => setCheckedIds([])}>Limpar</button><button className="danger-button" disabled={busy} onClick={() => setConfirmation(selected)}>Excluir selecionados ({selected.length})</button></>}
    </div>}
    {leads.length ? <div className="queue-list">{leads.map((lead, index) => <LeadCard key={lead.id} lead={lead} selected={lead.id === selectedId} checked={selected.includes(lead.id)} selectionDisabled={busy} onToggleChecked={() => toggle(lead.id)} onSelect={() => onSelect(lead.id)} onSkip={() => onSelect(leads[index + 1]?.id ?? leads[0]?.id)} />)}</div>
      : <div className="empty-queue"><span>✓</span><h3>Fila em dia</h3><p>Nenhum lead corresponde aos filtros atuais.</p></div>}
    <ConfirmDialog open={confirmation.length > 0} title={`Excluir ${confirmation.length} leads selecionados?`} message="Eles serão movidos para Excluídos e poderão ser restaurados. Você poderá importar essas pessoas novamente; os demais leads serão mantidos." confirmLabel="Excluir selecionados" danger busy={busy} onClose={() => { if (!busy) setConfirmation([]); }} onConfirm={async () => { await onDeleteMany(confirmation); setCheckedIds([]); setConfirmation([]); }} />
  </section>;
}
