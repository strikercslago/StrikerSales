import { describe, expect, it } from "vitest";
import { validateLeadBatch } from "@/lib/leads/validation";
import { toLeadRow } from "./lead-mapper";

describe("payload de persistência dos leads", () => {
  it("preserva false na importação em vez de enviar null ao banco", () => {
    const result = validateLeadBatch({ leads: [
      { name: "Clínica validada", city: "Blumenau", validation_required: false },
      { name: "Clínica pendente", city: "Joinville", validation_required: true },
    ] });
    const payload = JSON.parse(JSON.stringify([
      ...result.newLeads.map(toLeadRow),
      ...result.possibleDuplicates.map(toLeadRow),
    ]));
    expect(payload.map((row: Record<string, unknown>) => row.validation_required)).toEqual([false, true]);
  });

  it("preserva valores numéricos iguais a zero", () => {
    expect(toLeadRow({ rating: 0, reviewCount: 0, score: 0 })).toEqual({ rating: 0, review_count: 0, score: 0 });
  });

  it("omite campos não informados e continua permitindo limpar texto opcional", () => {
    const row = toLeadRow({ notes: "", website: undefined });
    expect(row).toEqual({ notes: null });
    expect(row).not.toHaveProperty("validation_required");
  });

  it("permite alterar validação para false em uma atualização parcial", () => {
    expect(toLeadRow({ validationRequired: false })).toEqual({ validation_required: false });
  });
});
