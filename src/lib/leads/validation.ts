import type { Lead, LeadPriority, LeadStatus } from "@/types/lead";
import { LEAD_STATUSES } from "@/types/lead";
import type { LeadBatch, LeadImportError, LeadImportResult } from "@/types/lead-import";
import { deduplicateLeads } from "./deduplication";
import { normalizePhone, phoneFromWhatsAppUrl } from "./normalize-phone";

const knownFields = new Set([
  "id", "name", "business_name", "segment", "city", "state", "country", "address",
  "phone", "whatsapp_url", "contact_url", "rating", "review_count", "score", "priority",
  "pain", "opportunity", "message", "followup_message", "notes", "website_status",
  "website", "instagram", "instagram_status", "status", "validation_required", "source", "maps_search_url",
  "followup_at", "approached_at", "responded_at", "proposal_at", "closed_at", "deleted_at",
]);

const str = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : undefined;
const num = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const bool = (value: unknown) => typeof value === "boolean" ? value : undefined;
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

function priority(value: unknown): LeadPriority {
  const normalized = str(value)?.toLowerCase().replace("é", "e");
  if (normalized === "alta" || normalized === "high") return "alta";
  if (normalized === "baixa" || normalized === "low") return "baixa";
  return "media";
}

function status(value: unknown): LeadStatus {
  const normalized = str(value)?.toLowerCase() as LeadStatus | undefined;
  return normalized && LEAD_STATUSES.includes(normalized) ? normalized : "novo";
}

function mapLead(input: unknown, index: number): Lead {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("O lead precisa ser um objeto.");
  }
  const row = input as Record<string, unknown>;
  const rawPhone = str(row.phone);
  const whatsappUrl = str(row.whatsapp_url);
  const normalizedPhone = normalizePhone(rawPhone) ?? phoneFromWhatsAppUrl(whatsappUrl);
  const name = str(row.name) ?? str(row.business_name);
  const city = str(row.city);
  if (!name && !normalizedPhone && !(str(row.id) && city)) {
    throw new Error("Informação insuficiente para identificar o lead.");
  }
  const now = new Date().toISOString();
  const extra = Object.fromEntries(Object.entries(row).filter(([key]) => !knownFields.has(key)));
  const leadName = name ?? normalizedPhone ?? `Lead ${index + 1}`;
  return {
    id: makeId(), externalId: str(row.id), name: leadName,
    businessName: str(row.business_name), segment: str(row.segment), city, state: str(row.state),
    country: str(row.country), address: str(row.address), phone: normalizedPhone ?? rawPhone, normalizedPhone,
    whatsappUrl, contactUrl: str(row.contact_url), rating: num(row.rating),
    reviewCount: num(row.review_count), score: num(row.score), priority: priority(row.priority),
    pain: str(row.pain), opportunity: str(row.opportunity), message: str(row.message) ?? "Olá! Tudo bem?",
    followupMessage: str(row.followup_message), notes: str(row.notes), website: str(row.website), websiteStatus: str(row.website_status),
    instagram: str(row.instagram), instagramStatus: str(row.instagram_status), status: status(row.status),
    validationRequired: bool(row.validation_required), source: str(row.source), mapsSearchUrl: str(row.maps_search_url),
    followupAt: str(row.followup_at), approachedAt: str(row.approached_at), respondedAt: str(row.responded_at),
    proposalAt: str(row.proposal_at), closedAt: str(row.closed_at), deletedAt: str(row.deleted_at), createdAt: now, updatedAt: now,
    history: [{ id: makeId(), type: "lead_imported", timestamp: now, data: { source: str(row.source) } }],
    extra,
  };
}

export function validateLeadBatch(input: unknown, existing: Lead[] = []): LeadImportResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("JSON inválido: objeto raiz esperado.");
  const root = input as Record<string, unknown>;
  if (!Array.isArray(root.leads)) throw new Error("JSON inválido: a propriedade 'leads' deve ser uma lista.");
  const batch: LeadBatch = {
    schema: str(root.schema), schemaVersion: str(root.schema_version),
    batch: root.batch && typeof root.batch === "object" && !Array.isArray(root.batch) ? root.batch as Record<string, unknown> : undefined,
    leads: root.leads,
    extra: Object.fromEntries(Object.entries(root).filter(([key]) => !["schema", "schema_version", "batch", "leads"].includes(key))),
  };
  const valid: Lead[] = [];
  const errors: LeadImportError[] = [];
  batch.leads.forEach((row, index) => {
    try { valid.push(mapLead(row, index)); }
    catch (error) { errors.push({ index, message: error instanceof Error ? error.message : "Lead inválido." }); }
  });
  const { unique, duplicates } = deduplicateLeads(valid, existing.filter((lead) => !lead.deletedAt));
  return { found: batch.leads.length, newLeads: unique, duplicates, errors, batch: batch.batch, batchExtra: batch.extra };
}
