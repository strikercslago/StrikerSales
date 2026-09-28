import { describe, expect, it } from "vitest";
import type { Lead } from "@/types/lead";
import { buildApproachReviewPackage, previewApproachReviews, validateApproachReviewResult } from "./approach-review";

const lead = (changes: Partial<Lead> = {}): Lead => ({ id: "lead-1", name: "Clínica Exemplo", status: "novo", priority: "media", message: "Mensagem antiga", followupMessage: "Follow antigo", opportunity: "Site institucional", createdAt: "2026-09-01", updatedAt: "2026-09-28T10:00:00Z", history: [], extra: { verified_observation: "O site não apresenta a equipe." }, ...changes });

describe("revisão de abordagens", () => {
  it("exporta somente leads novos e não abordados sem notas ou telefone", () => {
    const file = buildApproachReviewPackage([lead({ notes: "privado", phone: "54999999999" }), lead({ id: "lead-2", status: "abordado", approachedAt: "2026-09-28" })]);
    expect(file.leads).toHaveLength(1);
    expect(JSON.stringify(file)).not.toContain("privado");
    expect(JSON.stringify(file)).not.toContain("54999999999");
  });

  it("bloqueia resultado desatualizado e aceita revisão da mesma versão", () => {
    const current = lead();
    const result = validateApproachReviewResult({ schema: "striker-approach-review-result", schema_version: "1.0", export_id: "exp-1", reviews: [{ lead_id: current.id, expected_updated_at: current.updatedAt, message: "Nova mensagem", followup_message: "Novo follow" }] });
    expect(previewApproachReviews(result, [current])[0].state).toBe("applicable");
    expect(previewApproachReviews(result, [{ ...current, updatedAt: "2026-09-28T11:00:00Z" }])[0].state).toBe("stale");
  });

  it("nunca aplica revisão em lead já abordado", () => {
    const current = lead({ status: "abordado", approachedAt: "2026-09-28" });
    const result = validateApproachReviewResult({ schema: "striker-approach-review-result", schema_version: "1.0", export_id: "exp-1", reviews: [{ lead_id: current.id, expected_updated_at: current.updatedAt, message: "Nova" }] });
    expect(previewApproachReviews(result, [current])[0].state).toBe("ineligible");
  });
});
