"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CrmSettings, CrmSnapshot, Lead, LeadChanges, LeadDraft, LeadStatus } from "@/types/lead";
import type { LeadImportResult } from "@/types/lead-import";
import type { MigrationPreview, MigrationReport } from "@/types/repository";
import { LocalLeadRepository, defaultSettings } from "@/lib/persistence/local-lead-repository";
import { SupabaseLeadRepository } from "@/lib/persistence/supabase-lead-repository";
import { isDuplicate } from "@/lib/leads/deduplication";
import { orderLeads } from "@/lib/leads/ordering";

let officialRepository: SupabaseLeadRepository | undefined;
const repo = () => officialRepository ??= new SupabaseLeadRepository();
const localRepo = new LocalLeadRepository();

export function useCrm() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<CrmSettings>(defaultSettings());
  const [selectedId, setSelectedId] = useState<string>();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState<string>();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string }>();

  const notify = useCallback((type: "success" | "error", message: string) => {
    setFeedback({ type, message }); window.setTimeout(() => setFeedback(undefined), 4500);
  }, []);

  const refresh = useCallback(async () => {
    const [leads, target] = await Promise.all([repo().getLeads("all"), repo().getDailyGoal()]);
    setAllLeads(leads); setSettings({ dailyGoal: { target, date: new Date().toISOString().slice(0, 10) } });
    setSelectedId((current) => current && leads.some((lead) => lead.id === current && !lead.deletedAt) ? current : orderLeads(leads.filter((lead) => lead.status === "novo" && !lead.deletedAt))[0]?.id);
  }, []);

  useEffect(() => { void refresh().catch((error) => notify("error", error instanceof Error ? error.message : "Não foi possível carregar o CRM.")).finally(() => setReady(true)); }, [notify, refresh]);

  const execute = useCallback(async <T,>(key: string, action: () => Promise<T>, success?: string): Promise<T> => {
    setBusy(key); setFeedback(undefined);
    try { const result = await action(); if (success) notify("success", success); return result; }
    catch (error) { const message = error instanceof Error ? error.message : "A operação falhou."; notify("error", message); throw error; }
    finally { setBusy(undefined); }
  }, [notify]);

  const replaceLead = useCallback((updated: Lead) => setAllLeads((current) => current.map((lead) => lead.id === updated.id ? updated : lead)), []);

  const importLeads = useCallback(async (result: LeadImportResult) => {
    await execute("import", async () => { const imported = await repo().importBatch(result); setAllLeads((current) => [...current, ...imported]); if (!selectedId && imported[0]) setSelectedId(orderLeads(imported)[0].id); }, `${result.newLeads.length} leads importados.`);
  }, [execute, selectedId]);

  const createLead = useCallback(async (draft: LeadDraft) => {
    const candidate = { ...draft, id: "preview", name: draft.name || draft.businessName || "Lead", priority: draft.priority ?? "media", status: draft.status ?? "novo", message: draft.message ?? "", createdAt: "", updatedAt: "", history: [], extra: draft.extra ?? {} } as Lead;
    if (allLeads.some((lead) => lead.deletedAt && isDuplicate(candidate, [lead]))) throw new Error("Já existe um lead excluído correspondente. Restaure-o pela área Excluídos.");
    if (isDuplicate(candidate, allLeads)) throw new Error("Possível duplicidade encontrada. Revise telefone, origem ou nome e cidade.");
    return execute("create", async () => { const created = await repo().createLead(draft); setAllLeads((current) => [...current, created]); setSelectedId(created.id); return created; }, "Lead criado com sucesso.");
  }, [allLeads, execute]);

  const editLead = useCallback(async (id: string, changes: LeadChanges) => execute("edit", async () => { const updated = await repo().updateLead(id, changes); replaceLead(updated); return updated; }, "Lead atualizado."), [execute, replaceLead]);
  const softDeleteLead = useCallback(async (id: string) => execute("delete", async () => { const updated = await repo().softDeleteLead(id); replaceLead(updated); setSelectedId(undefined); return updated; }, "Lead movido para Excluídos."), [execute, replaceLead]);
  const softDeleteLeads = useCallback(async (ids: string[]) => execute("bulk-delete", async () => {
    const targets = [...new Set(ids)].filter((id) => allLeads.some((lead) => lead.id === id && !lead.deletedAt));
    let completed = 0;
    try {
      for (const id of targets) {
        const updated = await repo().softDeleteLead(id);
        replaceLead(updated);
        setSelectedId((current) => current === id ? undefined : current);
        completed += 1;
      }
    } catch (error) {
      // Reconcile mutations that may have succeeded before a history/network failure.
      await refresh().catch(() => undefined);
      throw new Error("Exclusão interrompida após " + completed + " de " + targets.length + " leads. Confira a fila e tente novamente. " + (error instanceof Error ? error.message : ""));
    }
    return completed;
  }, "Leads selecionados movidos para Excluídos. Você pode importá-los novamente."), [allLeads, execute, refresh, replaceLead]);

  const restoreLead = useCallback(async (id: string) => execute(`restore:${id}`, async () => { const updated = await repo().restoreLead(id); replaceLead(updated); return updated; }, "Lead restaurado."), [execute, replaceLead]);
  const permanentlyDeleteLead = useCallback(async (id: string) => execute(`permanent:${id}`, async () => { await repo().permanentlyDeleteLead(id); setAllLeads((current) => current.filter((lead) => lead.id !== id)); }, "Lead excluído permanentemente."), [execute]);

  const setStatus = useCallback(async (id: string, status: LeadStatus) => execute(`status:${id}`, async () => { const updated = await repo().changeStatus(id, status); replaceLead(updated); return updated; }, "Status atualizado."), [execute, replaceLead]);
  const saveMessage = useCallback(async (id: string, message: string) => execute(`message:${id}`, async () => { const updated = await repo().updateLead(id, { message }); replaceLead(updated); return updated; }), [execute, replaceLead]);

  const startApproach = useCallback(async (id: string, message: string) => execute(`approach:${id}`, async () => {
    const updated = await repo().markApproached(id, message); const changed = allLeads.map((lead) => lead.id === id ? updated : lead); setAllLeads(changed);
    return updated;
  }, "WhatsApp aberto. A abordagem foi registrada; envie a mensagem no WhatsApp."), [allLeads, execute]);

  const revertApproach = useCallback(async (id: string) => execute(`revert-approach:${id}`, async () => {
    const updated = await repo().revertApproach(id); replaceLead(updated); setSelectedId(id); return updated;
  }, "Lead voltou para Novo."), [execute, replaceLead]);

  const setFollowup = useCallback(async (id: string, followupAt?: string) => execute(`followup:${id}`, async () => { const updated = await repo().scheduleFollowup(id, followupAt); replaceLead(updated); return updated; }, followupAt ? "Follow-up agendado." : "Agendamento removido."), [execute, replaceLead]);

  const updateDailyGoal = useCallback(async (target: number) => execute("goal", async () => { await repo().setDailyGoal(target); setSettings((current) => ({ dailyGoal: { ...current.dailyGoal, target } })); }, "Meta diária atualizada."), [execute]);

  const exportBackup = useCallback(() => {
    const snapshot: CrmSnapshot = { version: 1, exportedAt: new Date().toISOString(), leads: allLeads, settings };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `striker-sales-backup-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [allLeads, settings]);

  const restoreBackup = useCallback(async (file: File) => execute("restore-backup", async () => { const snapshot = JSON.parse(await file.text()) as CrmSnapshot; await repo().migrateSnapshot(snapshot); await refresh(); }, "Backup mesclado ao Supabase."), [execute, refresh]);
  const getLocalMigrationPreview = useCallback(async (): Promise<{ snapshot: CrmSnapshot; preview: MigrationPreview }> => { const snapshot = await localRepo.load(); return { snapshot, preview: await repo().previewMigration(snapshot) }; }, []);
  const migrateLocalData = useCallback(async (snapshot: CrmSnapshot): Promise<MigrationReport> => execute("migrate", async () => { const report = await repo().migrateSnapshot(snapshot); await refresh(); return report; }, "Dados locais migrados com sucesso."), [execute, refresh]);

  const leads = useMemo(() => allLeads.filter((lead) => !lead.deletedAt), [allLeads]);
  const deletedLeads = useMemo(() => allLeads.filter((lead) => lead.deletedAt), [allLeads]);
  const selectedLead = useMemo(() => leads.find((lead) => lead.id === selectedId), [leads, selectedId]);
  return { ready, busy, feedback, leads, allLeads, deletedLeads, settings, selectedId, selectedLead, selectLead: setSelectedId, importLeads, createLead, editLead, softDeleteLead, softDeleteLeads, restoreLead, permanentlyDeleteLead, saveMessage, setStatus, startApproach, revertApproach, setFollowup, updateDailyGoal, exportBackup, restoreBackup, getLocalMigrationPreview, migrateLocalData };
}
