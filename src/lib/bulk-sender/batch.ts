import type { Lead } from "@/types/lead";
import type { BulkSenderCandidate, BulkSenderExportDraft, BulkSenderExportRow, BulkSenderPurpose } from "@/types/bulk-sender";
import { normalizePhone, phoneFromWhatsAppUrl } from "@/lib/leads/normalize-phone";

const unresolvedPlaceholder = /(?:\{\{[^}]+\}\}|\[[^\]]+\]|<[^>]+>)/;
const isTruthyFlag = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";
const wasApproached = (lead: Lead) => Boolean(lead.approachedAt || lead.history.some((event) => event.type === "approach_sent"));
const noContact = (lead: Lead) => lead.status === "sem_interesse" || lead.status === "possui_fornecedor" || lead.status === "fechado" || ["do_not_contact", "unsubscribed", "blocked"].some((key) => isTruthyFlag(lead.extra[key]));

export function bulkSenderEligibility(lead: Lead, purpose: BulkSenderPurpose): { phone?: string; message: string; reason?: string } {
  const phone = lead.normalizedPhone ?? normalizePhone(lead.phone) ?? phoneFromWhatsAppUrl(lead.whatsappUrl);
  const message = (purpose === "initial" ? lead.message : lead.followupMessage)?.trim() ?? "";
  if (lead.deletedAt) return { phone, message, reason: "Lead excluído ou arquivado." };
  if (!phone) return { message, reason: "Telefone ausente ou inválido." };
  if (!message) return { phone, message, reason: purpose === "initial" ? "Mensagem inicial vazia." : "Mensagem de acompanhamento vazia." };
  if (lead.validationRequired) return { phone, message, reason: "Validação pendente." };
  if (noContact(lead)) return { phone, message, reason: "Contato encerrado, bloqueado ou marcado para não contatar." };
  if (unresolvedPlaceholder.test(message)) return { phone, message, reason: "Mensagem contém campo de personalização pendente." };
  if (purpose === "initial" && wasApproached(lead)) return { phone, message, reason: "Primeira abordagem já registrada no histórico." };
  if (purpose === "followup") {
    if (!wasApproached(lead)) return { phone, message, reason: "Abordagem inicial ainda não registrada." };
    if (["respondeu", "interessado", "proposta"].includes(lead.status)) return { phone, message, reason: "O estado atual pede revisão manual antes de um acompanhamento." };
  }
  return { phone, message };
}

export function buildBulkSenderCandidates(leads: Lead[], purpose: BulkSenderPurpose, exports: { rows: BulkSenderExportRow[] }[] = []): BulkSenderCandidate[] {
  const candidates = leads.map((lead) => {
    const eligibility = bulkSenderEligibility(lead, purpose);
    return { leadId: lead.id, leadName: lead.name, originalPhone: lead.phone ?? "", normalizedPhone: eligibility.phone, message: eligibility.message, eligible: !eligibility.reason, reason: eligibility.reason, previouslyExported: exports.some((batch) => batch.rows.some((row) => row.leadId === lead.id)) } satisfies BulkSenderCandidate;
  });
  const byPhone = new Map<string, BulkSenderCandidate[]>();
  for (const candidate of candidates) if (candidate.eligible && candidate.normalizedPhone) byPhone.set(candidate.normalizedPhone, [...(byPhone.get(candidate.normalizedPhone) ?? []), candidate]);
  for (const group of byPhone.values()) {
    if (group.length < 2) continue;
    const messages = new Set(group.map((candidate) => candidate.message));
    if (messages.size > 1) {
      for (const candidate of group) { candidate.eligible = false; candidate.reason = "Telefone compartilhado com mensagens diferentes. Escolha um contato."; candidate.conflictLeadIds = group.map((item) => item.leadId); }
    } else {
      for (const duplicate of group.slice(1)) { duplicate.eligible = false; duplicate.reason = `Telefone duplicado; mantido em ${group[0].leadName}.`; }
    }
  }
  return candidates;
}

export function choosePhoneConflict(candidates: BulkSenderCandidate[], leadId: string): BulkSenderCandidate[] {
  const chosen = candidates.find((item) => item.leadId === leadId);
  if (!chosen?.normalizedPhone || !chosen.conflictLeadIds) return candidates;
  return candidates.map((item) => {
    if (!chosen.conflictLeadIds?.includes(item.leadId)) return item;
    return item.leadId === leadId
      ? { ...item, eligible: true, reason: undefined, conflictLeadIds: undefined }
      : { ...item, eligible: false, reason: `Telefone compartilhado; escolhido ${chosen.leadName}.`, conflictLeadIds: undefined };
  });
}

export async function fingerprintBulkSenderDraft(draft: BulkSenderExportDraft): Promise<string> {
  const source = JSON.stringify({ purpose: draft.purpose, campaign: draft.campaign ?? "", rows: [...draft.rows].sort((a, b) => a.leadId.localeCompare(b.leadId)).map(({ leadId, normalizedPhone, message }) => ({ leadId, normalizedPhone, message })) });
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
    return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
  }
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) hash = Math.imul(hash ^ source.charCodeAt(index), 16777619);
  return `fallback-${(hash >>> 0).toString(16)}`;
}
