import type { SupabaseClient } from "@supabase/supabase-js";
import type { CrmSnapshot, Lead, LeadChanges, LeadDraft, LeadEventType, LeadHistoryEvent, LeadStatus } from "@/types/lead";
import type { LeadImportResult } from "@/types/lead-import";
import type { ApproachReviewApplyReport, ApproachReviewItem } from "@/types/approach-review";
import type { BulkSenderExportRecord, BulkSenderExportSnapshot, BulkSenderSaveResult } from "@/types/bulk-sender";
import type { LeadFilters, LeadRepository, LeadScope, MigrationPreview, MigrationReport } from "@/types/repository";
import { getSupabaseClient } from "@/lib/supabase/client";
import { deduplicateLeads } from "@/lib/leads/deduplication";
import { mapHistoryRow, mapLeadRow, toLeadRow } from "./lead-mapper";
import { BULK_SENDER_PROFILE } from "@/lib/bulk-sender/profile";

type Row = Record<string, unknown>;
const rows = (value: unknown) => Array.isArray(value) ? value as Row[] : [];
const optionalString = (value: unknown) => typeof value === "string" ? value : undefined;

export class SupabaseLeadRepository implements LeadRepository {
  constructor(private readonly client: SupabaseClient = getSupabaseClient()) {}

  private async addHistory(leadId: string, eventType: LeadEventType, oldValue?: unknown, newValue?: unknown, metadata?: Record<string, unknown>) {
    const { error } = await this.client.from("lead_history").insert({ lead_id: leadId, event_type: eventType, old_value: oldValue ?? null, new_value: newValue ?? null, metadata: metadata ?? null });
    if (error) throw new Error(`Não foi possível registrar o histórico: ${error.message}`);
  }

  async getLeads(scope: LeadScope = "active") {
    let query = this.client.from("leads").select("*, lead_history(*)").order("created_at", { ascending: false });
    if (scope === "active") query = query.is("deleted_at", null);
    if (scope === "deleted") query = query.not("deleted_at", "is", null);
    const { data, error } = await query;
    if (error) throw new Error(`Não foi possível carregar os leads: ${error.message}`);
    return rows(data).map(mapLeadRow);
  }

  async getLeadById(id: string) {
    const { data, error } = await this.client.from("leads").select("*, lead_history(*)").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapLeadRow(data as Row) : undefined;
  }

  async createLead(draft: LeadDraft) {
    const payload = { ...draft, priority: draft.priority ?? "media", status: draft.status ?? "novo", message: draft.message ?? "" };
    const { data, error } = await this.client.from("leads").insert(toLeadRow(payload)).select("*").single();
    if (error) throw new Error(`Não foi possível criar o lead: ${error.message}`);
    const lead = mapLeadRow(data as Row);
    await this.addHistory(lead.id, "lead_created", undefined, toLeadRow(payload));
    return (await this.getLeadById(lead.id)) ?? lead;
  }

  async updateLead(id: string, changes: LeadChanges) {
    const current = await this.getLeadById(id);
    if (!current) throw new Error("Lead não encontrado.");
    const changed = Object.fromEntries(Object.entries(changes).filter(([key, value]) => JSON.stringify(current[key as keyof Lead]) !== JSON.stringify(value))) as LeadChanges;
    if (!Object.keys(changed).length) return current;
    const { data, error } = await this.client.from("leads").update(toLeadRow(changed)).eq("id", id).select("*").single();
    if (error) throw new Error(`Não foi possível atualizar o lead: ${error.message}`);
    const oldValue = Object.fromEntries(Object.keys(changed).map((key) => [key, current[key as keyof Lead]]));
    const event: LeadEventType = Object.keys(changed).length === 1 && changed.message !== undefined ? "message_edited" : "lead_updated";
    await this.addHistory(id, event, oldValue, changed, { fields: Object.keys(changed) });
    return (await this.getLeadById(id)) ?? mapLeadRow(data as Row);
  }

  async softDeleteLead(id: string) {
    const current = await this.getLeadById(id); if (!current) throw new Error("Lead não encontrado.");
    const deletedAt = new Date().toISOString();
    const { error } = await this.client.from("leads").update({ deleted_at: deletedAt }).eq("id", id);
    if (error) throw new Error(`Não foi possível excluir o lead: ${error.message}`);
    await this.addHistory(id, "lead_deleted", { deletedAt: null }, { deletedAt });
    return { ...current, deletedAt, updatedAt: deletedAt };
  }

  async restoreLead(id: string) {
    const current = await this.getLeadById(id); if (!current) throw new Error("Lead não encontrado.");
    const { error } = await this.client.from("leads").update({ deleted_at: null }).eq("id", id);
    if (error) throw new Error(`Não foi possível restaurar o lead: ${error.message}`);
    await this.addHistory(id, "lead_restored", { deletedAt: current.deletedAt }, { deletedAt: null });
    return { ...current, deletedAt: undefined, updatedAt: new Date().toISOString() };
  }

  async permanentlyDeleteLead(id: string) {
    const { error } = await this.client.from("leads").delete().eq("id", id);
    if (error) throw new Error(`Não foi possível excluir permanentemente: ${error.message}`);
  }

  async changeStatus(id: string, status: LeadStatus) {
    const current = await this.getLeadById(id); if (!current) throw new Error("Lead não encontrado.");
    const now = new Date().toISOString(); const update: Row = { status };
    if (status === "abordado") update.approached_at = current.approachedAt ?? now;
    if (status === "respondeu") update.responded_at = current.respondedAt ?? now;
    if (status === "proposta") update.proposal_at = current.proposalAt ?? now;
    if (status === "fechado") update.closed_at = current.closedAt ?? now;
    const { error } = await this.client.from("leads").update(update).eq("id", id);
    if (error) throw new Error(`Não foi possível alterar o status: ${error.message}`);
    const event: LeadEventType = status === "proposta" ? "proposal_created" : status === "fechado" ? "lead_won" : "status_changed";
    await this.addHistory(id, event, { status: current.status }, { status });
    return (await this.getLeadById(id))!;
  }

  async recordEvent(id: string, type: LeadEventType, metadata?: Record<string, unknown>) {
    await this.addHistory(id, type, undefined, undefined, metadata);
    const lead = await this.getLeadById(id); if (!lead) throw new Error("Lead não encontrado."); return lead;
  }

  async markApproached(id: string, message: string) {
    const { error } = await this.client.rpc("start_lead_approach", { p_lead_id: id, p_message: message });
    if (error) throw new Error(`Não foi possível registrar a abordagem: ${error.message}`);
    const lead = await this.getLeadById(id); if (!lead) throw new Error("Lead não encontrado após registrar a abordagem."); return lead;
  }

  async revertApproach(id: string) {
    const { error } = await this.client.rpc("revert_lead_approach", { p_lead_id: id });
    if (error) throw new Error(`Não foi possível desfazer a abordagem: ${error.message}`);
    const lead = await this.getLeadById(id); if (!lead) throw new Error("Lead não encontrado após desfazer a abordagem."); return lead;
  }

  async scheduleFollowup(id: string, followupAt?: string) {
    const current = await this.getLeadById(id); if (!current) throw new Error("Lead não encontrado.");
    const update: Row = { followup_at: followupAt ?? null }; if (followupAt) update.status = "followup";
    const { error } = await this.client.from("leads").update(update).eq("id", id);
    if (error) throw new Error(`Não foi possível salvar o follow-up: ${error.message}`);
    await this.addHistory(id, "followup_scheduled", { followupAt: current.followupAt }, { followupAt: followupAt ?? null });
    return (await this.getLeadById(id))!;
  }

  async searchLeads(query: string, filters: LeadFilters = {}) {
    const leads = await this.getLeads(filters.scope ?? "active"); const needle = query.trim().toLowerCase(); const phone = query.replace(/\D/g, "");
    return leads.filter((lead) => (!filters.status || lead.status === filters.status) && (!filters.segment || lead.segment === filters.segment) && (!filters.priority || lead.priority === filters.priority) && (!needle || lead.name.toLowerCase().includes(needle) || lead.businessName?.toLowerCase().includes(needle) || (phone && lead.normalizedPhone?.includes(phone))));
  }

  async getHistory(leadId: string): Promise<LeadHistoryEvent[]> {
    const { data, error } = await this.client.from("lead_history").select("*").eq("lead_id", leadId).order("created_at");
    if (error) throw new Error(error.message);
    return rows(data).map(mapHistoryRow);
  }

  async importBatch(result: LeadImportResult) {
    const batch = result.batch ?? {}; const name = typeof batch.name === "string" ? batch.name : "Lote importado";
    const searchId = typeof batch.prospecting_search_id === "string" ? batch.prospecting_search_id : undefined;
    if (searchId) {
      const { data: previous, error: previousError } = await this.client.from("lead_batches").select("id").contains("metadata", { prospectingSearchId: searchId }).maybeSingle();
      if (previousError) throw new Error(`Não foi possível verificar a importação: ${previousError.message}`);
      if (previous) throw new Error("O resultado desta busca já foi importado.");
    }
    const existing = await this.getLeads("all");
    const { unique, duplicates: currentDuplicates } = deduplicateLeads(result.newLeads, existing);
    const metadata = { ...result.batchExtra, ...(searchId ? { prospectingSearchId: searchId } : {}), campaignId: typeof batch.campaign_id === "string" ? batch.campaign_id : undefined, rejectedCandidates: result.rejectedCandidates };
    const { data: batchRow, error: batchError } = await this.client.from("lead_batches").insert({ name, schema_name: "striker-leads", schema_version: "1.0", source: typeof batch.source === "string" ? batch.source : null, original_lead_count: result.found, imported_lead_count: unique.length, duplicate_count: result.duplicates.length + currentDuplicates.length, error_count: result.errors.length, metadata }).select("id").single();
    if (batchError) throw new Error(`Não foi possível criar o lote: ${batchError.message}`);
    if (!unique.length) return [];
    const payload = unique.map((lead) => ({ ...toLeadRow(lead), batch_id: (batchRow as Row).id }));
    const { data, error } = await this.client.from("leads").insert(payload).select("*");
    if (error) throw new Error(`Não foi possível importar os leads: ${error.message}`);
    const imported = rows(data).map(mapLeadRow);
    const { error: historyError } = await this.client.from("lead_history").insert(imported.map((lead) => ({ lead_id: lead.id, event_type: "lead_imported", metadata: { batchId: (batchRow as Row).id, source: lead.source } })));
    if (historyError) throw new Error(`Leads importados, mas o histórico falhou: ${historyError.message}`);
    return Promise.all(imported.map(async (lead) => (await this.getLeadById(lead.id)) ?? lead));
  }

  async applyApproachReviews(reviews: ApproachReviewItem[]): Promise<ApproachReviewApplyReport> {
    const updatedLeadIds: string[] = [];
    for (const review of reviews) {
      const { data, error } = await this.client.from("leads").update({ message: review.message, followup_message: review.followupMessage ?? null })
        .eq("id", review.leadId).eq("status", "novo").is("approached_at", null).is("deleted_at", null).eq("updated_at", review.expectedUpdatedAt).select("id");
      if (error) throw new Error(`Não foi possível aplicar uma revisão: ${error.message}`);
      if (!rows(data).length) continue;
      updatedLeadIds.push(review.leadId);
      await this.addHistory(review.leadId, "message_edited", undefined, { message: review.message, followupMessage: review.followupMessage ?? null }, { source: "approach_review", rationale: review.rationale });
    }
    return { updated: updatedLeadIds.length, skipped: reviews.length - updatedLeadIds.length, updatedLeadIds };
  }

  async getBulkSenderExports(): Promise<BulkSenderExportSnapshot[]> {
    const { data, error } = await this.client.from("bulk_sender_exports").select("*").order("created_at", { ascending: false });
    if (error) {
      if (error.code === "PGRST205" || error.message.includes("bulk_sender_exports")) throw new Error("A estrutura do Bulk Sender ainda não foi instalada. Aplique a migration 202609280002 antes de exportar.");
      throw new Error(`Não foi possível carregar os lotes do Bulk Sender: ${error.message}`);
    }
    return rows(data).map((row) => ({ ...(row.snapshot as BulkSenderExportSnapshot), id: String(row.id), createdAt: String(row.created_at), fingerprint: String(row.fingerprint), batchName: String(row.batch_name), campaign: optionalString(row.campaign), purpose: String(row.purpose) as BulkSenderExportSnapshot["purpose"], ...BULK_SENDER_PROFILE }));
  }

  async saveBulkSenderExport(record: BulkSenderExportRecord): Promise<BulkSenderSaveResult> {
    const existing = await this.client.from("bulk_sender_exports").select("*").eq("fingerprint", record.fingerprint).maybeSingle();
    if (existing.error) {
      if (existing.error.code === "PGRST205" || existing.error.message.includes("bulk_sender_exports")) throw new Error("A estrutura do Bulk Sender ainda não foi instalada. Aplique a migration 202609280002 antes de exportar.");
      throw new Error(`Não foi possível verificar exportações anteriores: ${existing.error.message}`);
    }
    if (existing.data) return { snapshot: (await this.getBulkSenderExports()).find((item) => item.id === String(existing.data.id))!, created: false };
    const payload = { fingerprint: record.fingerprint, batch_name: record.batchName, campaign: record.campaign ?? null, purpose: record.purpose, profile_id: record.profileId, profile_version: record.profileVersion, snapshot: record };
    const { data, error } = await this.client.from("bulk_sender_exports").insert(payload).select("*").single();
    if (error) {
      if (error.code === "23505") { const repeated = (await this.getBulkSenderExports()).find((item) => item.fingerprint === record.fingerprint); if (repeated) return { snapshot: repeated, created: false }; }
      throw new Error(`Não foi possível registrar o lote: ${error.message}`);
    }
    return { snapshot: { ...record, id: String(data.id), createdAt: String(data.created_at) }, created: true };
  }

  async resolveLeadValidation(id: string) {
    const { error } = await this.client.rpc("resolve_lead_validation", { p_lead_id: id });
    if (error) throw new Error(`Não foi possível resolver a validação: ${error.message}`);
    return (await this.getLeadById(id))!;
  }

  async getDailyGoal() {
    const { data, error } = await this.client.from("app_settings").select("value").eq("key", "daily_goal").maybeSingle();
    if (error) throw new Error(error.message);
    const value = data?.value as Record<string, unknown> | undefined;
    return typeof value?.target === "number" ? value.target : 15;
  }

  async setDailyGoal(target: number) {
    const { error } = await this.client.from("app_settings").upsert({ key: "daily_goal", value: { target } }, { onConflict: "owner_id,key" });
    if (error) throw new Error(`Não foi possível salvar a meta: ${error.message}`);
  }

  async previewMigration(snapshot: CrmSnapshot): Promise<MigrationPreview> {
    const existing = await this.getLeads("all"); const { unique, duplicates } = deduplicateLeads(snapshot.leads, existing);
    return { found: snapshot.leads.length, newCount: unique.length, duplicateCount: duplicates.length, deletedDuplicates: duplicates.filter((lead) => Boolean(lead.deletedAt)) };
  }

  async migrateSnapshot(snapshot: CrmSnapshot): Promise<MigrationReport> {
    const existing = await this.getLeads("all"); const { unique, duplicates } = deduplicateLeads(snapshot.leads, existing);
    let historyCount = 0;
    for (const source of unique) {
      const created = await this.createLead(source);
      const legacy = source.history;
      if (legacy.length) {
        const { error } = await this.client.from("lead_history").insert(legacy.map((event) => ({ lead_id: created.id, event_type: event.type, metadata: { ...event.data, migratedFromLocal: true }, created_at: event.timestamp })));
        if (error) throw new Error(`Falha ao migrar histórico: ${error.message}`); historyCount += legacy.length;
      }
    }
    await this.setDailyGoal(snapshot.settings.dailyGoal.target);
    return { found: snapshot.leads.length, newCount: unique.length, duplicateCount: duplicates.length, deletedDuplicates: duplicates.filter((lead) => Boolean(lead.deletedAt)), importedCount: unique.length, historyCount, settingsMigrated: true };
  }
}
