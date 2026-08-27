import type { Lead } from "./lead";

export interface LeadBatch {
  schema?: string;
  schemaVersion?: string;
  batch?: Record<string, unknown>;
  leads: unknown[];
  extra: Record<string, unknown>;
}

export interface LeadImportError {
  index: number;
  message: string;
}

export interface LeadImportResult {
  found: number;
  newLeads: Lead[];
  duplicates: Lead[];
  errors: LeadImportError[];
  batch?: Record<string, unknown>;
  batchExtra: Record<string, unknown>;
}
