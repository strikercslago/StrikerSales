import type { Lead } from "@/types/lead";
import { getWhatsAppPhone } from "./whatsapp";
import { normalizePhone } from "./normalize-phone";

const textKey = (value?: string) =>
  value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

function keys(lead: Lead) {
  const phone = lead.normalizedPhone ?? normalizePhone(lead.phone);
  const whatsapp = getWhatsAppPhone(undefined, lead.whatsappUrl);
  const nameCity = textKey(lead.name) && textKey(lead.city)
    ? `${textKey(lead.name)}::${textKey(lead.city)}`
    : undefined;
  const external = lead.externalId && lead.source ? `${textKey(lead.source)}::${textKey(lead.externalId)}` : undefined;
  return { phone, whatsapp, nameCity, external };
}

export function isDuplicate(candidate: Lead, existing: Lead[]) {
  const candidateKeys = keys(candidate);
  return existing.some((lead) => {
    const current = keys(lead);
    return Boolean(
      (candidateKeys.phone && candidateKeys.phone === current.phone) ||
      (candidateKeys.phone && candidateKeys.phone === current.whatsapp) ||
      (candidateKeys.whatsapp && candidateKeys.whatsapp === current.phone) ||
      (candidateKeys.whatsapp && candidateKeys.whatsapp === current.whatsapp) ||
      (candidateKeys.external && candidateKeys.external === current.external) ||
      (candidateKeys.nameCity && candidateKeys.nameCity === current.nameCity),
    );
  });
}

export function deduplicateLeads(candidates: Lead[], existing: Lead[]) {
  const unique: Lead[] = [];
  const duplicates: Lead[] = [];
  for (const lead of candidates) {
    if (isDuplicate(lead, [...existing, ...unique])) duplicates.push(lead);
    else unique.push(lead);
  }
  return { unique, duplicates };
}
