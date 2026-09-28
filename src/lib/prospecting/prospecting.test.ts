import { describe, expect, it } from "vitest";
import type { Lead } from "@/types/lead";
import { buildExclusionFile, buildKnownCompanies, buildProspectingPrompt, newCampaign, prepareSearch } from "./prospecting";

const lead = (overrides: Partial<Lead> = {}): Lead => ({ id: "lead-1", name: "Empresa Teste", city: "Caxias do Sul", state: "RS", phone: "5554999999999", normalizedPhone: "5554999999999", priority: "media", status: "novo", message: "interno e privado", notes: "não exportar", createdAt: "2026-09-28", updatedAt: "2026-09-28", history: [], extra: {}, ...overrides });

describe("central de prospecção", () => {
  it("inclui ativos, excluídos e rejeitados sem exportar notas ou mensagens", () => {
    const campaign = newCampaign();
    const search = { ...prepareSearch(campaign, 10), rejectedCandidates: [{ name: "Rejeitada", reason: "fora do perfil" }] };
    const companies = buildKnownCompanies([lead(), lead({ id: "lead-2", name: "Na lixeira", deletedAt: "2026-09-28" })], [search]);
    const serialized = JSON.stringify(buildExclusionFile(search, companies));
    expect(companies.map((item) => item.reason)).toEqual(["lead", "deleted_lead", "rejected_candidate"]);
    expect(serialized).not.toContain("interno e privado");
    expect(serialized).not.toContain("não exportar");
  });

  it("gera instruções e schema vinculados à busca", () => {
    const campaign = { ...newCampaign(), name: "Serra", service: "Sites", regions: "RS", segments: "Clínicas" };
    const search = prepareSearch(campaign, 15, "sem site");
    const prompt = buildProspectingPrompt(campaign, search);
    expect(prompt).toContain(search.id);
    expect(prompt).toContain("striker-prospecting-result");
    expect(prompt).toContain("Não invente contatos");
  });
});
