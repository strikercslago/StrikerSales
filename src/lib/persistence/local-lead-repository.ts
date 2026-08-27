import type { CrmSettings, CrmSnapshot, Lead, LeadChanges, LeadDraft, LeadEventType, LeadStatus } from "@/types/lead";
import type { LeadImportResult } from "@/types/lead-import";
import type { LeadFilters, LeadRepository, LeadScope, MigrationPreview, MigrationReport } from "@/types/repository";
import { deduplicateLeads } from "@/lib/leads/deduplication";
import { normalizePhone, phoneFromWhatsAppUrl } from "@/lib/leads/normalize-phone";

const STORAGE_KEY = "striker-sales:crm:v1";
const today = () => new Date().toISOString().slice(0, 10);

export const defaultSettings = (): CrmSettings => ({ dailyGoal: { target: 15, date: today() } });
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
const event = (type: LeadEventType, data?: Record<string, unknown>) => ({ id: makeId(), type, timestamp: new Date().toISOString(), data });

function emptySnapshot(): CrmSnapshot {
  return { version: 1, exportedAt: new Date().toISOString(), leads: [], settings: defaultSettings() };
}

function validateSnapshot(input: unknown): CrmSnapshot {
  if (!input || typeof input !== "object") throw new Error("Backup inválido.");
  const value = input as Partial<CrmSnapshot>;
  if (value.version !== 1 || !Array.isArray(value.leads) || !value.settings?.dailyGoal) {
    throw new Error("Formato de backup incompatível.");
  }
  return { ...value, exportedAt: new Date().toISOString() } as CrmSnapshot;
}

export class LocalLeadRepository implements LeadRepository {
  async load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySnapshot();
    try {
      const snapshot = validateSnapshot(JSON.parse(raw));
      if (snapshot.settings.dailyGoal.date !== today()) {
        snapshot.settings.dailyGoal.date = today();
      }
      return snapshot;
    } catch {
      return emptySnapshot();
    }
  }

  private current() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? validateSnapshot(JSON.parse(raw)) : emptySnapshot();
  }

  async saveLeads(leads: Lead[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...this.current(), leads, exportedAt: new Date().toISOString() }));
  }

  async saveSettings(settings: CrmSettings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...this.current(), settings, exportedAt: new Date().toISOString() }));
  }

  async restore(snapshot: CrmSnapshot) {
    const valid = validateSnapshot(snapshot);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    return valid;
  }

  async getLeads(scope: LeadScope = "active") {
    const leads = (await this.load()).leads;
    return leads.filter((lead) => scope === "all" || (scope === "deleted" ? Boolean(lead.deletedAt) : !lead.deletedAt));
  }

  async getLeadById(id: string) { return (await this.load()).leads.find((lead) => lead.id === id); }

  async createLead(draft: LeadDraft) {
    const now = new Date().toISOString();
    const lead: Lead = { ...draft, id: makeId(), name: draft.name || draft.businessName || "Novo lead", normalizedPhone: normalizePhone(draft.phone) ?? phoneFromWhatsAppUrl(draft.whatsappUrl), priority: draft.priority ?? "media", status: draft.status ?? "novo", message: draft.message ?? "", createdAt: now, updatedAt: now, history: [event("lead_created")], extra: draft.extra ?? {} };
    const snapshot = await this.load(); await this.saveLeads([...snapshot.leads, lead]); return lead;
  }

  async updateLead(id: string, changes: LeadChanges) {
    const snapshot = await this.load(); let updated: Lead | undefined;
    const leads = snapshot.leads.map((lead) => {
      if (lead.id !== id) return lead;
      const changed = Object.fromEntries(Object.entries(changes).filter(([key, value]) => JSON.stringify(lead[key as keyof Lead]) !== JSON.stringify(value))) as LeadChanges;
      const oldValue = Object.fromEntries(Object.keys(changed).map((key) => [key, lead[key as keyof Lead]]));
      const historyEvent: LeadEventType = Object.keys(changed).length === 1 && changed.message !== undefined ? "message_edited" : "lead_updated";
      updated = { ...lead, ...changed, normalizedPhone: changes.phone !== undefined || changes.whatsappUrl !== undefined ? normalizePhone(changes.phone ?? lead.phone) ?? phoneFromWhatsAppUrl(changes.whatsappUrl ?? lead.whatsappUrl) : lead.normalizedPhone, updatedAt: new Date().toISOString(), history: [...lead.history, event(historyEvent, { oldValue, newValue: changed, fields: Object.keys(changed) })] };
      return updated;
    });
    if (!updated) throw new Error("Lead não encontrado."); await this.saveLeads(leads); return updated;
  }

  async softDeleteLead(id: string) { await this.updateLead(id, { deletedAt: new Date().toISOString() }); return this.recordEvent(id, "lead_deleted"); }
  async restoreLead(id: string) { await this.updateLead(id, { deletedAt: undefined }); return this.recordEvent(id, "lead_restored"); }
  async permanentlyDeleteLead(id: string) { const snapshot = await this.load(); await this.saveLeads(snapshot.leads.filter((lead) => lead.id !== id)); }
  async changeStatus(id: string, status: LeadStatus) {
    const lead = await this.getLeadById(id); if (!lead) throw new Error("Lead não encontrado."); const now = new Date().toISOString();
    const timestamps: LeadChanges = status === "abordado" ? { approachedAt: lead.approachedAt ?? now } : status === "respondeu" ? { respondedAt: lead.respondedAt ?? now } : status === "proposta" ? { proposalAt: lead.proposalAt ?? now } : status === "fechado" ? { closedAt: lead.closedAt ?? now } : {};
    await this.updateLead(id, { status, ...timestamps }); return this.recordEvent(id, status === "proposta" ? "proposal_created" : status === "fechado" ? "lead_won" : "status_changed", { from: lead.status, to: status });
  }
  async recordEvent(id: string, type: LeadEventType, metadata?: Record<string, unknown>) { const snapshot = await this.load(); let updated: Lead | undefined; const leads = snapshot.leads.map((lead) => { if (lead.id !== id) return lead; updated = { ...lead, history: [...lead.history, event(type, metadata)] }; return updated; }); if (!updated) throw new Error("Lead não encontrado."); await this.saveLeads(leads); return updated; }
  async markApproached(id: string, message: string) {
    const snapshot = await this.load(); let updated: Lead | undefined; const approachedAt = new Date().toISOString();
    const leads = snapshot.leads.map((lead) => {
      if (lead.id !== id) return lead;
      updated = { ...lead, message, status: "abordado", approachedAt, updatedAt: approachedAt, history: [...lead.history, event("whatsapp_opened", { message }), event("approach_sent", { oldValue: { status: lead.status, approachedAt: lead.approachedAt, message: lead.message }, newValue: { status: "abordado", approachedAt, message } })] };
      return updated;
    });
    if (!updated) throw new Error("Lead não encontrado."); await this.saveLeads(leads); return updated;
  }
  async revertApproach(id: string) {
    const snapshot = await this.load(); let updated: Lead | undefined; const now = new Date().toISOString();
    const leads = snapshot.leads.map((lead) => {
      if (lead.id !== id) return lead;
      updated = { ...lead, status: "novo", approachedAt: undefined, updatedAt: now, history: [...lead.history, event("approach_reverted", { oldValue: { status: lead.status, approachedAt: lead.approachedAt }, newValue: { status: "novo", approachedAt: null } })] };
      return updated;
    });
    if (!updated) throw new Error("Lead não encontrado."); await this.saveLeads(leads); return updated;
  }
  async scheduleFollowup(id: string, followupAt?: string) { await this.updateLead(id, { followupAt, ...(followupAt ? { status: "followup" as const } : {}) }); return this.recordEvent(id, "followup_scheduled", { followupAt: followupAt ?? null }); }
  async searchLeads(query: string, filters: LeadFilters = {}) { const leads = await this.getLeads(filters.scope); const needle = query.toLowerCase(); return leads.filter((lead) => (!filters.status || lead.status === filters.status) && (!filters.segment || lead.segment === filters.segment) && (!filters.priority || lead.priority === filters.priority) && (!needle || lead.name.toLowerCase().includes(needle) || lead.businessName?.toLowerCase().includes(needle) || lead.normalizedPhone?.includes(query.replace(/\D/g, "")))); }
  async getHistory(leadId: string) { return (await this.getLeadById(leadId))?.history ?? []; }
  async importBatch(result: LeadImportResult) { const snapshot = await this.load(); await this.saveLeads([...snapshot.leads, ...result.newLeads]); return result.newLeads; }
  async getDailyGoal() { return (await this.load()).settings.dailyGoal.target; }
  async setDailyGoal(target: number) { const snapshot = await this.load(); await this.saveSettings({ dailyGoal: { ...snapshot.settings.dailyGoal, target } }); }
  async previewMigration(snapshot: CrmSnapshot): Promise<MigrationPreview> { const { unique, duplicates } = deduplicateLeads(snapshot.leads, await this.getLeads("all")); return { found: snapshot.leads.length, newCount: unique.length, duplicateCount: duplicates.length, deletedDuplicates: duplicates.filter((lead) => Boolean(lead.deletedAt)) }; }
  async migrateSnapshot(snapshot: CrmSnapshot): Promise<MigrationReport> { const preview = await this.previewMigration(snapshot); const existing = await this.getLeads("all"); const { unique } = deduplicateLeads(snapshot.leads, existing); await this.saveLeads([...existing, ...unique]); await this.setDailyGoal(snapshot.settings.dailyGoal.target); return { ...preview, importedCount: unique.length, historyCount: unique.reduce((sum, lead) => sum + lead.history.length, 0), settingsMigrated: true }; }
}
