export const LEAD_STATUSES = [
  "novo",
  "abordado",
  "respondeu",
  "interessado",
  "sem_interesse",
  "possui_fornecedor",
  "followup",
  "proposta",
  "fechado",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadPriority = "alta" | "media" | "baixa";

export type LeadEventType =
  | "lead_imported"
  | "lead_created"
  | "lead_updated"
  | "whatsapp_opened"
  | "approach_sent"
  | "approach_reverted"
  | "status_changed"
  | "message_edited"
  | "followup_sent"
  | "followup_scheduled"
  | "proposal_created"
  | "lead_won"
  | "lead_deleted"
  | "lead_restored";

export interface LeadHistoryEvent {
  id: string;
  type: LeadEventType;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface Lead {
  id: string;
  externalId?: string;
  batchId?: string;
  name: string;
  businessName?: string;
  segment?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  phone?: string;
  normalizedPhone?: string;
  whatsappUrl?: string;
  contactUrl?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  score?: number;
  priority: LeadPriority;
  pain?: string;
  opportunity?: string;
  message: string;
  followupMessage?: string;
  notes?: string;
  websiteStatus?: string;
  instagram?: string;
  instagramStatus?: string;
  status: LeadStatus;
  validationRequired?: boolean;
  source?: string;
  mapsSearchUrl?: string;
  followupAt?: string;
  approachedAt?: string;
  respondedAt?: string;
  proposalAt?: string;
  closedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  history: LeadHistoryEvent[];
  extra: Record<string, unknown>;
}

export type LeadDraft = Omit<Lead, "id" | "createdAt" | "updatedAt" | "history" | "extra" | "priority" | "status" | "message"> & {
  priority?: LeadPriority;
  status?: LeadStatus;
  message?: string;
  extra?: Record<string, unknown>;
};

export type LeadChanges = Partial<Omit<Lead, "id" | "createdAt" | "history">>;

export interface DailyGoal {
  target: number;
  date: string;
}

export interface CrmSettings {
  dailyGoal: DailyGoal;
}

export interface CrmSnapshot {
  version: 1;
  exportedAt: string;
  leads: Lead[];
  settings: CrmSettings;
}
