import type { Lead } from "@/types/lead";
import type { KnownCompany, ProspectingCampaign, ProspectingSearch, ProspectingState, RejectedCandidate } from "@/types/prospecting";

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export const emptyProspectingState = (): ProspectingState => ({ version: 1, campaigns: [], searches: [] });

export function newCampaign(): ProspectingCampaign {
  const now = new Date().toISOString();
  return { id: makeId(), name: "Minha campanha", service: "", regions: "", segments: "", idealProfile: "", qualificationCriteria: "", exclusionCriteria: "", targetCount: 20, approachGuidance: "Tom consultivo, direto e cordial.", createdAt: now, updatedAt: now };
}

export function prepareSearch(campaign: ProspectingCampaign, targetCount: number, focus?: string): ProspectingSearch {
  const now = new Date().toISOString();
  return { id: makeId(), campaignId: campaign.id, campaignName: campaign.name, focus: focus?.trim() || undefined, targetCount, status: "awaiting_result", createdAt: now, updatedAt: now, approvedCount: 0, duplicateCount: 0, possibleDuplicateCount: 0, rejectedCandidates: [] };
}

const stringExtra = (lead: Lead, key: string) => typeof lead.extra[key] === "string" ? lead.extra[key] as string : undefined;

export function buildKnownCompanies(leads: Lead[], searches: ProspectingSearch[]): KnownCompany[] {
  const fromLeads: KnownCompany[] = leads.map((lead) => ({
    name: lead.businessName || lead.name,
    city: lead.city,
    state: lead.state,
    phone: lead.normalizedPhone || lead.phone,
    website: lead.website,
    instagram: lead.instagram,
    external_id: lead.externalId,
    source: lead.source,
    cnpj: stringExtra(lead, "cnpj"),
    reason: lead.deletedAt ? "deleted_lead" : "lead",
  }));
  const fromRejected: KnownCompany[] = searches.flatMap((search) => search.rejectedCandidates.map((candidate) => ({
    name: candidate.name, city: candidate.city, state: candidate.state, phone: candidate.phone,
    website: candidate.website, instagram: candidate.instagram, external_id: candidate.externalId,
    source: candidate.source, reason: search.status === "reviewing" ? "in_review" as const : "rejected_candidate" as const,
  })));
  const seen = new Set<string>();
  return [...fromLeads, ...fromRejected].filter((company) => {
    const key = JSON.stringify([company.source, company.external_id, company.phone, company.website, company.instagram, company.name.toLocaleLowerCase("pt-BR"), company.city?.toLocaleLowerCase("pt-BR")]);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

export function buildExclusionFile(search: ProspectingSearch, companies: KnownCompany[]) {
  return { schema: "striker-known-companies", schema_version: "1.0", generated_at: new Date().toISOString(), search_id: search.id, notice: "Fotografia da base no momento da geração. Compare antes de aprofundar a pesquisa.", companies };
}

export function buildProspectingPrompt(campaign: ProspectingCampaign, search: ProspectingSearch) {
  const focus = search.focus ? `\nFoco adicional desta busca: ${search.focus}` : "";
  return `Você atuará como pesquisador comercial para a campanha “${campaign.name}”. Encontre até ${search.targetCount} empresas com alta aderência, sem repetir empresas conhecidas.\n\nCONTEXTO\nServiço oferecido: ${campaign.service}\nRegiões: ${campaign.regions}\nSegmentos: ${campaign.segments}\nPerfil ideal: ${campaign.idealProfile}\nCritérios de qualificação: ${campaign.qualificationCriteria}\nCritérios de exclusão: ${campaign.exclusionCriteria}\nOrientações de abordagem: ${campaign.approachGuidance}${focus}\n\nARQUIVO OBRIGATÓRIO\nUse o arquivo striker-known-companies anexado. Antes de aprofundar qualquer candidato, compare nome, cidade, telefone, domínio, Instagram, identificador externo e fonte. Descarte correspondências confirmadas. Em caso de dúvida entre filial e duplicata, marque validation_required=true. O arquivo é uma fotografia da base; não presuma que ele elimina toda possibilidade de repetição.\n\nSEQUÊNCIA\n1. Encontre candidatos.\n2. Compare a identidade com o arquivo de exclusão.\n3. Aprofunde somente empresas aparentemente novas.\n4. Qualifique usando os critérios da campanha.\n5. Prepare abordagem apenas para candidatos qualificados.\n\nQUALIDADE\nUse fontes públicas e inclua URLs e data de consulta. Separe fatos observados de hipóteses. Não invente contatos, faturamento, perda de vendas, problemas ou necessidades. Marque dados não confirmados. Se houver poucos candidatos bons, entregue menos e explique; não reduza os critérios para completar a quantidade. A mensagem inicial deve ser curta, personalizada e baseada em uma observação verificável.\n\nFORMATO DE SAÍDA\nRetorne somente JSON válido, sem bloco Markdown, neste formato:\n${JSON.stringify({ schema: "striker-prospecting-result", schema_version: "1.0", batch: { name: campaign.name, source: "gpt-6-astra", prospecting_search_id: search.id, campaign_id: campaign.id }, leads: [{ id: "identificador-na-fonte", name: "Empresa", business_name: "Razão ou nome comercial", segment: "Segmento", city: "Cidade", state: "UF", phone: "telefone comercial", website: "https://...", instagram: "@perfil", source: "fonte principal", source_urls: ["https://..."], researched_at: "AAAA-MM-DD", verified_observation: "fato observado", opportunity: "oportunidade fundamentada", priority: "alta|media|baixa", priority_reason: "justificativa", message: "mensagem inicial", followup_message: "acompanhamento", validation_required: false, validation_notes: "pendências" }], rejected_candidates: [{ name: "Empresa", city: "Cidade", state: "UF", phone: "", website: "", instagram: "", external_id: "", source: "", reason: "motivo objetivo" }] }, null, 2)}\n\nNão acrescente comentários fora do JSON.`;
}

export function sanitizeRejectedCandidate(input: unknown): RejectedCandidate | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const row = input as Record<string, unknown>;
  const value = (key: string) => typeof row[key] === "string" && row[key].trim() ? row[key].trim() : undefined;
  const name = value("name"); const reason = value("reason");
  if (!name || !reason) return undefined;
  return { name, reason, city: value("city"), state: value("state"), phone: value("phone"), website: value("website"), instagram: value("instagram"), externalId: value("external_id"), source: value("source") };
}
