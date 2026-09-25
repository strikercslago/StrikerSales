"use client";

import { useEffect, useMemo, useState } from "react";
import { useCrm } from "@/hooks/use-crm";
import { orderLeads } from "@/lib/leads/ordering";
import { normalizePhone } from "@/lib/leads/normalize-phone";
import type { StatusFilter } from "@/components/dashboard/filters";
import { AppHeader } from "@/components/dashboard/app-header";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { DailyGoal } from "@/components/dashboard/daily-goal";
import { Followups } from "@/components/dashboard/followups";
import { Filters } from "@/components/dashboard/filters";
import { ProspectingQueue } from "@/components/leads/prospecting-queue";
import { LeadDetails } from "@/components/leads/lead-details";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { DeletedLeadsDialog } from "@/components/leads/deleted-leads-dialog";
import { ImportDialog } from "@/components/import/import-dialog";
import { LocalMigrationDialog } from "@/components/migration/local-migration-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { useMobileLayout } from "@/hooks/use-mobile-layout";
import { useLeadNavigation } from "@/hooks/use-lead-navigation";

export function AppShell() {
  const crm = useCrm();
  const mobile = useMobileLayout();
  const { detailOpen, openLead, closeLead } = useLeadNavigation(crm.selectLead);
  const [mobileView, setMobileView] = useState<"queue" | "overview">("queue");
  const [importOpen, setImportOpen] = useState(false); const [newOpen, setNewOpen] = useState(false); const [editOpen, setEditOpen] = useState(false);
  const [deletedOpen, setDeletedOpen] = useState(false); const [migrationOpen, setMigrationOpen] = useState(false); const [deleteConfirm, setDeleteConfirm] = useState(false); const [revertConfirm, setRevertConfirm] = useState(false);
  const [status, setStatusFilter] = useState<StatusFilter>("novo"); const [segment, setSegment] = useState(""); const [priority, setPriority] = useState(""); const [query, setQuery] = useState("");
  useEffect(() => {
    if (mobile && !detailOpen) { setEditOpen(false); setDeleteConfirm(false); setRevertConfirm(false); }
  }, [mobile, detailOpen]);
  const segments = useMemo(() => [...new Set(crm.leads.map((lead) => lead.segment).filter((value): value is string => Boolean(value)))].sort(), [crm.leads]);
  const filtered = useMemo(() => { const needle = query.trim().toLocaleLowerCase("pt-BR"); const phoneNeedle = query.replace(/\D/g, ""); return orderLeads(crm.leads.filter((lead) => {
    if (status !== "todos" && lead.status !== status) return false; if (segment && lead.segment !== segment) return false; if (priority && lead.priority !== priority) return false; if (!needle) return true;
    return lead.name.toLocaleLowerCase("pt-BR").includes(needle) || lead.businessName?.toLocaleLowerCase("pt-BR").includes(needle) || (phoneNeedle && normalizePhone(lead.phone)?.includes(phoneNeedle));
  })); }, [crm.leads, priority, query, segment, status]);
  const selectedIndex = filtered.findIndex((lead) => lead.id === crm.selectedId);
  const nextCandidate = filtered.length ? filtered[(selectedIndex + 1) % filtered.length] : undefined;
  const nextLead = nextCandidate?.id !== crm.selectedId ? nextCandidate : undefined;
  const details = <LeadDetails lead={crm.selectedLead} busy={Boolean(crm.busy)} onClose={closeLead} onEdit={() => setEditOpen(true)} onDelete={() => setDeleteConfirm(true)} onStartApproach={(message) => crm.startApproach(crm.selectedLead!.id, message)} onRevertApproach={() => setRevertConfirm(true)} onSaveMessage={(message) => crm.saveMessage(crm.selectedLead!.id, message)} onStatus={(nextStatus) => crm.setStatus(crm.selectedLead!.id, nextStatus)} onFollowup={(at) => crm.setFollowup(crm.selectedLead!.id, at)} onNext={nextLead ? () => openLead(nextLead.id) : undefined} />;
  if (!crm.ready) return <div className="loading-screen"><div className="brand-mark">S</div><p>Carregando seus leads...</p></div>;
  return <div className="app-shell">
    <AppHeader deletedCount={crm.deletedLeads.length} onNewLead={() => setNewOpen(true)} onImport={() => setImportOpen(true)} onExport={crm.exportBackup} onRestore={crm.restoreBackup} onDeleted={() => setDeletedOpen(true)} onMigrate={() => setMigrationOpen(true)} />
    <main className={`dashboard mobile-view-${mobileView}`}>
      <div className="mobile-work-switch" aria-label="Área de trabalho"><button aria-pressed={mobileView === "queue"} onClick={() => setMobileView("queue")}>Fila de leads <span>{filtered.length}</span></button><button aria-pressed={mobileView === "overview"} onClick={() => setMobileView("overview")}>Resumo do dia</button></div>
      <section className="dashboard-overview" aria-label="Resumo do dia"><div className="dashboard-heading"><div><p className="eyebrow">CENTRAL DE PROSPECÇÃO</p><h1>Visão geral</h1><p>Priorize oportunidades e mantenha seu ritmo comercial.</p></div><div className="today"><span>Hoje</span><strong>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</strong></div></div>
      <MetricsGrid leads={crm.leads} /><div className="dashboard-row"><DailyGoal leads={crm.leads} settings={crm.settings} onChange={(value) => void crm.updateDailyGoal(value)} /><Followups leads={crm.leads} onSelect={openLead} /></div></section>
      <section className="dashboard-work" aria-label="Fila de leads">
      <Filters status={status} segment={segment} priority={priority} query={query} segments={segments} onStatus={setStatusFilter} onSegment={setSegment} onPriority={setPriority} onQuery={setQuery} />
      <div className={`workspace ${crm.selectedLead ? "has-detail" : ""}`}><ProspectingQueue key={JSON.stringify([status, segment, priority, query])} busy={Boolean(crm.busy)} onDeleteMany={crm.softDeleteLeads} leads={filtered} selectedId={mobile && !detailOpen ? undefined : crm.selectedId} onSelect={openLead} onClearFilters={() => { setStatusFilter("todos"); setSegment(""); setPriority(""); setQuery(""); }} onNewLead={() => setNewOpen(true)} />{!mobile && details}</div>
      </section>
    </main>
    {mobile && <Modal open={detailOpen && Boolean(crm.selectedLead)} onClose={closeLead} label="Detalhes do lead" fullScreen>{details}{crm.feedback && <div role="status" className={`toast ${crm.feedback.type}`}>{crm.feedback.message}</div>}</Modal>}
    {crm.feedback && !(mobile && detailOpen) && <div role="status" className={`toast ${crm.feedback.type}`}>{crm.feedback.message}</div>}
    {importOpen && <ImportDialog open={importOpen} existing={crm.allLeads} importing={crm.busy === "import"} onClose={() => setImportOpen(false)} onImport={crm.importLeads} />}
    <LeadFormDialog open={newOpen} saving={crm.busy === "create"} onClose={() => setNewOpen(false)} onSave={crm.createLead} />
    <LeadFormDialog open={editOpen} lead={crm.selectedLead} saving={crm.busy === "edit"} onClose={() => setEditOpen(false)} onSave={(draft) => crm.editLead(crm.selectedLead!.id, draft)} />
    <ConfirmDialog open={deleteConfirm} title="Excluir este lead?" message="Ele será movido para Excluídos e poderá ser restaurado posteriormente." confirmLabel="Excluir lead" danger busy={crm.busy === "delete"} onClose={() => setDeleteConfirm(false)} onConfirm={async () => { await crm.softDeleteLead(crm.selectedLead!.id); closeLead(); }} />
    <ConfirmDialog open={revertConfirm} title="Voltar este lead para Novo?" message="A abertura do WhatsApp continuará registrada no histórico." confirmLabel="Desfazer abordagem" busy={crm.busy?.startsWith("revert-approach:")} onClose={() => setRevertConfirm(false)} onConfirm={() => crm.revertApproach(crm.selectedLead!.id)} />
    <DeletedLeadsDialog open={deletedOpen} leads={crm.deletedLeads} busy={crm.busy} onClose={() => setDeletedOpen(false)} onRestore={crm.restoreLead} onPermanentDelete={crm.permanentlyDeleteLead} />
    <LocalMigrationDialog open={migrationOpen} busy={crm.busy === "migrate"} onClose={() => setMigrationOpen(false)} onPreview={crm.getLocalMigrationPreview} onMigrate={crm.migrateLocalData} />
  </div>;
}
