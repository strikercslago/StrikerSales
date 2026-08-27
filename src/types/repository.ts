import type { CrmSnapshot, Lead, LeadChanges, LeadDraft, LeadHistoryEvent, LeadPriority, LeadStatus } from "./lead";
import type { LeadImportResult } from "./lead-import";

export type LeadScope = "active" | "deleted" | "all";
export interface LeadFilters { status?: LeadStatus; segment?: string; priority?: LeadPriority; scope?: LeadScope; }
export interface MigrationPreview { found: number; newCount: number; duplicateCount: number; deletedDuplicates: Lead[]; }
export interface MigrationReport extends MigrationPreview { importedCount: number; historyCount: number; settingsMigrated: boolean; }

export interface LeadRepository {
  getLeads(scope?: LeadScope): Promise<Lead[]>;
  getLeadById(id: string): Promise<Lead | undefined>;
  createLead(draft: LeadDraft): Promise<Lead>;
  updateLead(id: string, changes: LeadChanges): Promise<Lead>;
  softDeleteLead(id: string): Promise<Lead>;
  restoreLead(id: string): Promise<Lead>;
  permanentlyDeleteLead(id: string): Promise<void>;
  changeStatus(id: string, status: LeadStatus): Promise<Lead>;
  recordEvent(id: string, type: LeadHistoryEvent["type"], metadata?: Record<string, unknown>): Promise<Lead>;
  markApproached(id: string, message: string): Promise<Lead>;
  revertApproach(id: string): Promise<Lead>;
  scheduleFollowup(id: string, followupAt?: string): Promise<Lead>;
  searchLeads(query: string, filters?: LeadFilters): Promise<Lead[]>;
  getHistory(leadId: string): Promise<LeadHistoryEvent[]>;
  importBatch(result: LeadImportResult): Promise<Lead[]>;
  getDailyGoal(): Promise<number>;
  setDailyGoal(target: number): Promise<void>;
  previewMigration(snapshot: CrmSnapshot): Promise<MigrationPreview>;
  migrateSnapshot(snapshot: CrmSnapshot): Promise<MigrationReport>;
}
