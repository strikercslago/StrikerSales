import type { Lead, LeadChanges, LeadDraft, LeadHistoryEvent } from "@/types/lead";
import { normalizePhone, phoneFromWhatsAppUrl } from "@/lib/leads/normalize-phone";

type Row = Record<string, unknown>;
const optionalString = (value: unknown) => typeof value === "string" ? value : undefined;
const optionalNumber = (value: unknown) => typeof value === "number" ? value : value == null ? undefined : Number(value);

export function mapHistoryRow(row: Row): LeadHistoryEvent {
  const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata as Record<string, unknown> : {};
  return {
    id: String(row.id),
    type: String(row.event_type) as LeadHistoryEvent["type"],
    timestamp: String(row.created_at),
    data: { ...metadata, ...(row.old_value == null ? {} : { oldValue: row.old_value }), ...(row.new_value == null ? {} : { newValue: row.new_value }) },
  };
}

export function mapLeadRow(row: Row): Lead {
  const historyRows = Array.isArray(row.lead_history) ? row.lead_history as Row[] : [];
  return {
    id: String(row.id), externalId: optionalString(row.external_id), batchId: optionalString(row.batch_id),
    name: String(row.name), businessName: optionalString(row.business_name), segment: optionalString(row.segment),
    city: optionalString(row.city), state: optionalString(row.state), country: optionalString(row.country), address: optionalString(row.address),
    phone: optionalString(row.phone), normalizedPhone: optionalString(row.normalized_phone), whatsappUrl: optionalString(row.whatsapp_url),
    contactUrl: optionalString(row.contact_url), website: optionalString(row.website), websiteStatus: optionalString(row.website_status),
    instagram: optionalString(row.instagram), instagramStatus: optionalString(row.instagram_status), rating: optionalNumber(row.rating),
    reviewCount: optionalNumber(row.review_count), score: optionalNumber(row.score), priority: String(row.priority) as Lead["priority"],
    pain: optionalString(row.pain), opportunity: optionalString(row.opportunity), message: optionalString(row.message) ?? "",
    followupMessage: optionalString(row.followup_message), notes: optionalString(row.notes), status: String(row.status) as Lead["status"],
    validationRequired: Boolean(row.validation_required), source: optionalString(row.source), mapsSearchUrl: optionalString(row.maps_search_url),
    approachedAt: optionalString(row.approached_at), respondedAt: optionalString(row.responded_at), followupAt: optionalString(row.followup_at),
    proposalAt: optionalString(row.proposal_at), closedAt: optionalString(row.closed_at), deletedAt: optionalString(row.deleted_at),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
    history: historyRows.map(mapHistoryRow).sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    extra: row.extra && typeof row.extra === "object" ? row.extra as Record<string, unknown> : {},
  };
}

export function toLeadRow(input: LeadDraft | LeadChanges): Row {
  const source = input as Record<string, unknown>;
  const map: Record<string, string> = {
    externalId: "external_id", batchId: "batch_id", businessName: "business_name", normalizedPhone: "normalized_phone",
    whatsappUrl: "whatsapp_url", contactUrl: "contact_url", websiteStatus: "website_status", instagramStatus: "instagram_status",
    reviewCount: "review_count", followupMessage: "followup_message", validationRequired: "validation_required", mapsSearchUrl: "maps_search_url",
    approachedAt: "approached_at", respondedAt: "responded_at", followupAt: "followup_at", proposalAt: "proposal_at",
    closedAt: "closed_at", deletedAt: "deleted_at",
  };
  const allowed = ["externalId", "batchId", "name", "businessName", "segment", "city", "state", "country", "address", "phone", "normalizedPhone", "whatsappUrl", "contactUrl", "website", "websiteStatus", "instagram", "instagramStatus", "rating", "reviewCount", "score", "priority", "pain", "opportunity", "message", "followupMessage", "notes", "status", "validationRequired", "source", "mapsSearchUrl", "approachedAt", "respondedAt", "followupAt", "proposalAt", "closedAt", "deletedAt", "extra"];
  const row: Row = {};
  for (const key of allowed) if (source[key] !== undefined) row[map[key] ?? key] = source[key] || null;
  if (source.phone !== undefined || source.whatsappUrl !== undefined) {
    row.normalized_phone = normalizePhone(optionalString(source.phone)) ?? phoneFromWhatsAppUrl(optionalString(source.whatsappUrl)) ?? null;
  }
  return row;
}
