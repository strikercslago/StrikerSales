import type { Lead } from "@/types/lead";
import { getWhatsAppPhone } from "./whatsapp";
import { normalizePhone } from "./normalize-phone";

const textKey = (value?: string) =>
  value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

const domainKey = (value?: string) => {
  if (!value) return undefined;
  try { return new URL(value.match(/^https?:\/\//) ? value : `https://${value}`).hostname.replace(/^www\./, "").toLowerCase(); }
  catch { return textKey(value)?.replace(/^@/, ""); }
};

const instagramKey = (value?: string) => textKey(value)?.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/^@/, "").replace(/\/$/, "");

function keys(lead: Lead) {
  const phone = lead.normalizedPhone ?? normalizePhone(lead.phone);
  const whatsapp = getWhatsAppPhone(undefined, lead.whatsappUrl);
  const nameCity = textKey(lead.name) && textKey(lead.city)
    ? `${textKey(lead.name)}::${textKey(lead.city)}`
    : undefined;
  const external = lead.externalId && lead.source ? `${textKey(lead.source)}::${textKey(lead.externalId)}` : undefined;
  const domain = domainKey(lead.website);
  const instagram = instagramKey(lead.instagram);
  const nameState = textKey(lead.name) && textKey(lead.state) ? `${textKey(lead.name)}::${textKey(lead.state)}` : undefined;
  return { phone, whatsapp, nameCity, external, domain, instagram, nameState };
}

export type DuplicateKind = "confirmed" | "possible" | "none";

export function duplicateKind(candidate: Lead, existing: Lead[]): DuplicateKind {
  const candidateKeys = keys(candidate);
  let possible = false;
  for (const lead of existing) {
    const current = keys(lead);
    if (
      (candidateKeys.phone && candidateKeys.phone === current.phone) ||
      (candidateKeys.phone && candidateKeys.phone === current.whatsapp) ||
      (candidateKeys.whatsapp && candidateKeys.whatsapp === current.phone) ||
      (candidateKeys.whatsapp && candidateKeys.whatsapp === current.whatsapp) ||
      (candidateKeys.external && candidateKeys.external === current.external) ||
      (candidateKeys.nameCity && candidateKeys.nameCity === current.nameCity)
    ) return "confirmed";
    if ((candidateKeys.domain && candidateKeys.domain === current.domain) ||
        (candidateKeys.instagram && candidateKeys.instagram === current.instagram) ||
        (candidateKeys.nameState && candidateKeys.nameState === current.nameState)) possible = true;
  }
  return possible ? "possible" : "none";
}

export function isDuplicate(candidate: Lead, existing: Lead[]) {
  return duplicateKind(candidate, existing) === "confirmed";
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

export function classifyLeads(candidates: Lead[], existing: Lead[]) {
  const unique: Lead[] = [];
  const duplicates: Lead[] = [];
  const possibleDuplicates: Lead[] = [];
  for (const lead of candidates) {
    const kind = duplicateKind(lead, [...existing, ...unique, ...possibleDuplicates]);
    if (kind === "confirmed") duplicates.push(lead);
    else if (kind === "possible") possibleDuplicates.push(lead);
    else unique.push(lead);
  }
  return { unique, duplicates, possibleDuplicates };
}
