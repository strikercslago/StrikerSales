export type BulkSenderPurpose = "initial" | "followup";

export interface BulkSenderExportRow {
  leadId: string;
  leadName: string;
  originalPhone: string;
  normalizedPhone: string;
  message: string;
}

export interface BulkSenderExclusion {
  leadId: string;
  leadName: string;
  reason: string;
}

export interface BulkSenderExportSnapshot {
  id: string;
  fingerprint: string;
  batchName: string;
  campaign?: string;
  purpose: BulkSenderPurpose;
  profileId: "waplus-sender-template";
  profileVersion: "1.0";
  profileValidated: true;
  sheetName: "Sheet1";
  columns: readonly ["WhatsApp Number(with country code)", "First Name", "Last Name", "Other"];
  rows: BulkSenderExportRow[];
  exclusions: BulkSenderExclusion[];
  createdAt: string;
}

export type BulkSenderExportRecord = Omit<BulkSenderExportSnapshot, "id" | "createdAt">;
export interface BulkSenderSaveResult { snapshot: BulkSenderExportSnapshot; created: boolean; }

export interface BulkSenderCandidate {
  leadId: string;
  leadName: string;
  originalPhone: string;
  normalizedPhone?: string;
  message: string;
  eligible: boolean;
  reason?: string;
  conflictLeadIds?: string[];
  previouslyExported: boolean;
}

export interface BulkSenderExportDraft {
  batchName: string;
  campaign?: string;
  purpose: BulkSenderPurpose;
  rows: BulkSenderExportRow[];
  exclusions: BulkSenderExclusion[];
}
