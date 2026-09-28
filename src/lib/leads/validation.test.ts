import { describe, expect, it } from "vitest";
import { validateLeadBatch } from "./validation";

const batch = { leads: [{ name: "Empresa A", city: "Porto Alegre", phone: "51999991234", id: "origem-1", source: "lista" }] };

describe("reimportação de leads excluídos", () => {
  it("bloqueia a reimportação de um lead que está na lixeira", () => {
    const original = validateLeadBatch(batch).newLeads[0];
    const deleted = { ...original, deletedAt: "2026-09-25T12:00:00Z" };
    const result = validateLeadBatch(batch, [deleted]);
    expect(result.newLeads).toHaveLength(0);
    expect(result.duplicates).toHaveLength(1);
    expect(deleted.deletedAt).toBeTruthy();
  });

  it("continua bloqueando duplicados ativos mesmo que também existam excluídos", () => {
    const active = validateLeadBatch(batch).newLeads[0];
    const result = validateLeadBatch(batch, [{ ...active, id: "deleted", deletedAt: "2026-09-25" }, active]);
    expect(result.newLeads).toHaveLength(0);
    expect(result.duplicates).toHaveLength(1);
  });

  it("remove duplicados dentro do próprio arquivo", () => {
    const result = validateLeadBatch({ leads: [batch.leads[0], batch.leads[0]] });
    expect(result.newLeads).toHaveLength(1);
    expect(result.duplicates).toHaveLength(1);
  });

  it("separa domínio compartilhado como possível duplicata", () => {
    const current = validateLeadBatch({ leads: [{ name: "Matriz", city: "Caxias", website: "https://empresa.com" }] }).newLeads[0];
    const result = validateLeadBatch({ leads: [{ name: "Empresa Filial", city: "Bento", website: "www.empresa.com" }] }, [current]);
    expect(result.newLeads).toHaveLength(0);
    expect(result.possibleDuplicates).toHaveLength(1);
    expect(result.duplicates).toHaveLength(0);
  });
});
