import type { Lead } from "@/types/lead";
import type { ApproachReviewExportLead, ApproachReviewPackage, ApproachReviewPreviewItem, ApproachReviewResult } from "@/types/approach-review";

const string = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : undefined;
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export function isReviewEligible(lead: Lead) {
  return !lead.deletedAt && lead.status === "novo" && !lead.approachedAt;
}

function urlsFromLead(lead: Lead) {
  const extraUrls = Array.isArray(lead.extra.source_urls) ? lead.extra.source_urls.filter((item): item is string => typeof item === "string") : [];
  return [...new Set([lead.website, lead.instagram, lead.contactUrl, lead.mapsSearchUrl, ...extraUrls].filter((item): item is string => Boolean(item)))];
}

function exportLead(lead: Lead): ApproachReviewExportLead {
  const verified = string(lead.extra.verified_observation);
  return {
    lead_id: lead.id,
    expected_updated_at: lead.updatedAt,
    name: lead.name,
    business_name: lead.businessName,
    segment: lead.segment,
    city: lead.city,
    state: lead.state,
    opportunity: lead.opportunity,
    verified_observation: verified,
    source_urls: urlsFromLead(lead),
    current_message: lead.message,
    current_followup_message: lead.followupMessage,
  };
}

export function buildApproachReviewPackage(leads: Lead[]): ApproachReviewPackage {
  const exportId = makeId();
  const eligible = leads.filter(isReviewEligible).map(exportLead);
  return {
    schema: "striker-approach-review",
    schema_version: "1.0",
    export_id: exportId,
    exported_at: new Date().toISOString(),
    instructions: "Revise somente as mensagens dos leads fornecidos. Preserve lead_id e expected_updated_at exatamente. Use apenas fatos presentes no registro; não invente problemas, resultados, contatos ou necessidades. Escreva uma abordagem curta, humana, específica e sem pressão. Evite elogios genéricos e afirmações de que a empresa perde vendas. O follow-up deve acrescentar contexto e não repetir a primeira mensagem. Retorne somente JSON válido no formato required_output, sem Markdown ou comentários externos.",
    required_output: {
      schema: "striker-approach-review-result",
      schema_version: "1.0",
      export_id: exportId,
      reviews: [{ lead_id: "copiar do lead", expected_updated_at: "copiar do lead", message: "mensagem revisada", followup_message: "follow-up revisado", rationale: "motivo breve das mudanças" }],
    },
    leads: eligible,
  };
}

export function validateApproachReviewResult(input: unknown): ApproachReviewResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Arquivo inválido: objeto raiz esperado.");
  const root = input as Record<string, unknown>;
  if (root.schema !== "striker-approach-review-result" || root.schema_version !== "1.0") throw new Error("Este arquivo não é um resultado de revisão de abordagens compatível.");
  const exportId = string(root.export_id); if (!exportId) throw new Error("O resultado não informa o identificador da exportação.");
  if (!Array.isArray(root.reviews)) throw new Error("O resultado precisa conter a lista reviews.");
  const reviews: ApproachReviewResult["reviews"] = [];
  const errors: ApproachReviewResult["errors"] = [];
  const seen = new Set<string>();
  root.reviews.forEach((value, index) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) { errors.push({ index, message: "Revisão precisa ser um objeto." }); return; }
    const row = value as Record<string, unknown>;
    const leadId = string(row.lead_id); const expectedUpdatedAt = string(row.expected_updated_at); const message = string(row.message);
    if (!leadId || !expectedUpdatedAt || !message) { errors.push({ index, message: "lead_id, expected_updated_at e message são obrigatórios." }); return; }
    if (seen.has(leadId)) { errors.push({ index, message: "Lead repetido no arquivo." }); return; }
    seen.add(leadId);
    reviews.push({ leadId, expectedUpdatedAt, message, followupMessage: string(row.followup_message), rationale: string(row.rationale) });
  });
  return { exportId, reviews, errors };
}

export function previewApproachReviews(result: ApproachReviewResult, leads: Lead[]): ApproachReviewPreviewItem[] {
  const byId = new Map(leads.map((lead) => [lead.id, lead]));
  return result.reviews.map((review) => {
    const lead = byId.get(review.leadId);
    const base = { ...review, leadName: lead?.businessName || lead?.name || "Lead não encontrado", currentMessage: lead?.message || "", currentFollowupMessage: lead?.followupMessage };
    if (!lead) return { ...base, state: "missing" as const, reason: "O lead não existe mais." };
    if (!isReviewEligible(lead)) return { ...base, state: "ineligible" as const, reason: "O lead já foi abordado, mudou de etapa ou foi excluído." };
    if (lead.updatedAt !== review.expectedUpdatedAt) return { ...base, state: "stale" as const, reason: "O lead foi alterado depois da exportação." };
    if (lead.message.trim() === review.message.trim() && (lead.followupMessage || "").trim() === (review.followupMessage || "").trim()) return { ...base, state: "unchanged" as const, reason: "Nenhuma mudança nas mensagens." };
    return { ...base, state: "applicable" as const };
  });
}
