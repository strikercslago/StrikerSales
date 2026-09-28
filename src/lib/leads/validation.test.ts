import { describe, expect, it } from "vitest";
import { validateLeadBatch } from "./validation";

const batch = { leads: [{ name: "Empresa A", city: "Porto Alegre", phone: "51999991234", id: "origem-1", source: "lista" }] };

describe("reimportação de leads excluídos", () => {
  it("não confunde perfis diferentes do Linktree e Bio Sites", () => {
    for (const host of ["linktr.ee", "bio.site"]) {
      const result = validateLeadBatch({ leads: [
        { name: "Clínica A", city: "Joinville", website: `https://${host}/clinica-a` },
        { name: "Clínica B", city: "Blumenau", website: `https://${host}/clinica-b` },
      ] });
      expect(result.newLeads).toHaveLength(2);
      expect(result.possibleDuplicates).toHaveLength(0);
    }
  });

  it("revisa o mesmo perfil compartilhado ignorando barra final e parâmetros", () => {
    const result = validateLeadBatch({ leads: [
      { name: "Clínica A", city: "Joinville", website: "https://linktr.ee/clinica" },
      { name: "Clínica Filial", city: "Blumenau", website: "https://linktr.ee/clinica/?utm_source=instagram" },
    ] });
    expect(result.newLeads).toHaveLength(1);
    expect(result.possibleDuplicates).toHaveLength(1);
  });

  it("mantém registros com validação pendente em revisão mesmo sem duplicata", () => {
    const result = validateLeadBatch({ leads: [
      { name: "Clínica", city: "Joinville", validation_required: true, validation_notes: "Confirmar telefone" },
    ] });
    expect(result.newLeads).toHaveLength(0);
    expect(result.possibleDuplicates).toHaveLength(1);
    expect(result.possibleDuplicates[0].extra.validation_notes).toBe("Confirmar telefone");
  });

  it("continua bloqueando duplicatas confirmadas de registros em revisão", () => {
    const row = { name: "Clínica", city: "Joinville", validation_required: true };
    const result = validateLeadBatch({ leads: [row, row] });
    expect(result.possibleDuplicates).toHaveLength(1);
    expect(result.duplicates).toHaveLength(1);
  });

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
