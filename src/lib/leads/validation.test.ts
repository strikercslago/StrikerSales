import { describe, expect, it } from "vitest";
import { validateLeadBatch } from "./validation";

const batch = { leads: [{ name: "Empresa A", city: "Porto Alegre", phone: "51999991234", id: "origem-1", source: "lista" }] };

describe("reimportação de leads excluídos", () => {
  it("permite reimportar um excluído com um novo ID e mantém o registro anterior", () => {
    const original = validateLeadBatch(batch).newLeads[0];
    const deleted = { ...original, deletedAt: "2026-09-25T12:00:00Z" };
    const result = validateLeadBatch(batch, [deleted]);
    expect(result.newLeads).toHaveLength(1);
    expect(result.duplicates).toHaveLength(0);
    expect(result.newLeads[0].id).not.toBe(original.id);
    expect(result.newLeads[0].deletedAt).toBeUndefined();
    expect(deleted.deletedAt).toBeTruthy();
  });

  it("continua bloqueando duplicados ativos mesmo que também existam excluídos", () => {
    const active = validateLeadBatch(batch).newLeads[0];
    const result = validateLeadBatch(batch, [{ ...active, id: "deleted", deletedAt: "2026-09-25" }, active]);
    expect(result.newLeads).toHaveLength(0);
    expect(result.duplicates).toHaveLength(1);
  });

  it("remove duplicados dentro do próprio arquivo na reimportação", () => {
    const deleted = { ...validateLeadBatch(batch).newLeads[0], deletedAt: "2026-09-25" };
    const result = validateLeadBatch({ leads: [batch.leads[0], batch.leads[0]] }, [deleted]);
    expect(result.newLeads).toHaveLength(1);
    expect(result.duplicates).toHaveLength(1);
  });
});
