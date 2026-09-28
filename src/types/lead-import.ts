import type { Lead } from "./lead";
import type { RejectedCandidate } from "./prospecting";

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
  possibleDuplicates: Lead[];
  rejectedCandidates: RejectedCandidate[];
  errors: LeadImportError[];
  batch?: Record<string, unknown>;
  batchExtra: Record<string, unknown>;
}
