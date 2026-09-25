import { useState } from "react";
import type { Lead } from "@/types/lead";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LeadCard } from "./lead-card";

export function ProspectingQueue({ leads, selectedId, onSelect, busy, onDeleteMany, onClearFilters, onNewLead }: {
  leads: Lead[]; selectedId?: string; onSelect: (id: string) => void; busy?: boolean;
  onDeleteMany: (ids: string[]) => Promise<unknown>; onClearFilters: () => void; onNewLead: () => void;
}) {
  const [selecting, setSelecting] = useState(false);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState<string[]>([]);
  const selected = leads.filter((lead) => checkedIds.includes(lead.id)).map((lead) => lead.id);
  const allChecked = leads.length > 0 && selected.length === leads.length;
  const toggle = (id: string) => setCheckedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  return <section className="queue-section">
    <div className="section-heading"><div><p className="eyebrow">UM CONTATO POR VEZ</p><h2>Prospecção <span className="count-pill">{leads.length}</span></h2></div>
      {leads.length > 0 && <button className="secondary-button" aria-pressed={selecting} disabled={busy} onClick={() => { setSelecting(!selecting); setCheckedIds([]); }}>{selecting ? "Cancelar seleção" : "Selecionar"}</button>}
    </div>
    {selecting && <div className="queue-bulk-actions">
      <label><input type="checkbox" checked={allChecked} ref={(element) => { if (element) element.indeterminate = selected.length > 0 && !allChecked; }} disabled={busy} onChange={() => setCheckedIds(allChecked ? [] : leads.map((lead) => lead.id))} /><span>Todos desta fila ({leads.length})</span></label>
      <span role="status">{selected.length} selecionados</span>
      <button className="danger-button" disabled={busy || !selected.length} onClick={() => setConfirmation(selected)}>Excluir ({selected.length})</button>
    </div>}
    {leads.length ? <div className="queue-list">{leads.map((lead) => <LeadCard key={lead.id} lead={lead} selected={lead.id === selectedId} checked={selected.includes(lead.id)} selectionDisabled={busy} onToggleChecked={selecting ? () => toggle(lead.id) : undefined} onSelect={() => onSelect(lead.id)} />)}</div>
      : <div className="empty-queue"><span>✓</span><h3>Nenhum lead nesta fila</h3><p>Experimente outros filtros ou cadastre um contato para começar.</p><div className="empty-queue-actions"><button className="secondary-button" onClick={onClearFilters}>Ver todos os leads</button><button className="primary-button" onClick={onNewLead}>Novo lead</button></div></div>}
    <ConfirmDialog open={confirmation.length > 0} title={`Excluir ${confirmation.length} leads selecionados?`} message="Eles serão movidos para Excluídos e poderão ser restaurados. Os demais leads serão mantidos." confirmLabel="Excluir selecionados" danger busy={busy} onClose={() => setConfirmation([])} onConfirm={async () => { await onDeleteMany(confirmation); setCheckedIds([]); setSelecting(false); }} />
  </section>;
}
