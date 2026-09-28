import { describe, expect, it } from "vitest";
import type { Lead } from "@/types/lead";
import { buildBulkSenderCandidates, bulkSenderEligibility, choosePhoneConflict } from "./batch";

const lead = (changes: Partial<Lead> = {}): Lead => ({ id: "lead-1", name: "Clínica Exemplo", phone: "(54) 99999-0000", normalizedPhone: "5554999990000", priority: "alta", status: "novo", message: "Olá, Ana! 👋\nTudo bem?", followupMessage: "Posso enviar a prévia?", createdAt: "2026-09-28T10:00:00.000Z", updatedAt: "2026-09-28T10:00:00.000Z", history: [], extra: {}, ...changes });

describe("lotes do Bulk Sender", () => {
  it("exclui telefone inválido, mensagem vazia e validação pendente", () => {
    expect(bulkSenderEligibility(lead({ phone: "123", normalizedPhone: undefined }), "initial").reason).toContain("Telefone");
    expect(bulkSenderEligibility(lead({ message: "" }), "initial").reason).toContain("Mensagem");
    expect(bulkSenderEligibility(lead({ validationRequired: true }), "initial").reason).toBe("Validação pendente.");
  });

  it("recusa primeira abordagem já registrada e acompanhamento sem abordagem", () => {
    expect(bulkSenderEligibility(lead({ approachedAt: "2026-09-28T11:00:00.000Z" }), "initial").reason).toContain("já registrada");
    expect(bulkSenderEligibility(lead(), "followup").reason).toContain("ainda não registrada");
  });

  it("deduplica por telefone e exige escolha quando as mensagens divergem", () => {
    const same = buildBulkSenderCandidates([lead(), lead({ id: "lead-2", name: "Unidade 2" })], "initial");
    expect(same.filter((item) => item.eligible)).toHaveLength(1);
    const conflict = buildBulkSenderCandidates([lead(), lead({ id: "lead-2", name: "Unidade 2", message: "Outra mensagem" })], "initial");
    expect(conflict.every((item) => !item.eligible && item.conflictLeadIds)).toBe(true);
    const chosen = choosePhoneConflict(conflict, "lead-2");
    expect(chosen.find((item) => item.leadId === "lead-2")?.eligible).toBe(true);
    expect(chosen.find((item) => item.leadId === "lead-1")?.eligible).toBe(false);
  });

  it("preserva acentos, emoji e quebras e aponta placeholders pendentes", () => {
    expect(bulkSenderEligibility(lead(), "initial").message).toBe("Olá, Ana! 👋\nTudo bem?");
    expect(bulkSenderEligibility(lead({ message: "Olá, [Nome]" }), "initial").reason).toContain("personalização");
  });
});
