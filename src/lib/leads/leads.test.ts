import { describe, expect, it } from "vitest";
import { normalizePhone } from "./normalize-phone";
import { buildWhatsAppUrl } from "./whatsapp";
import { validateLeadBatch } from "./validation";
import { orderLeads } from "./ordering";

const batch = (leads: unknown[]) => ({ schema: "striker-leads", schema_version: "1.0", batch: { name: "Teste" }, leads });

describe("telefones e WhatsApp", () => {
  it("normaliza números brasileiros sem duplicar 55", () => {
    expect(normalizePhone("(54) 99999-1234")).toBe("5554999991234");
    expect(normalizePhone("+55 54 99999-1234")).toBe("5554999991234");
  });
  it("gera wa.me com mensagem codificada", () => {
    expect(buildWhatsAppUrl("54999991234", "Olá & tudo bem?")).toBe("https://wa.me/5554999991234?text=Ol%C3%A1%20%26%20tudo%20bem%3F");
  });
});

describe("importação", () => {
  it("aceita campos opcionais e preserva campos desconhecidos", () => {
    const result = validateLeadBatch(batch([{ name: "Lead A", city: "Passo Fundo", campo_novo: 42 }]));
    expect(result.newLeads).toHaveLength(1);
    expect(result.newLeads[0].extra.campo_novo).toBe(42);
  });
  it("detecta duplicidade por telefone e dentro do próprio lote", () => {
    const result = validateLeadBatch(batch([
      { name: "A", phone: "(54) 99999-1234" },
      { name: "B", phone: "+55 54 99999-1234" },
    ]));
    expect(result.newLeads).toHaveLength(1);
    expect(result.duplicates).toHaveLength(1);
  });
  it("detecta duplicidade por nome e cidade", () => {
    const first = validateLeadBatch(batch([{ name: "Clínica São José", city: "Passo Fundo" }])).newLeads;
    const second = validateLeadBatch(batch([{ name: "Clinica Sao Jose", city: "PASSO FUNDO" }]), first);
    expect(second.duplicates).toHaveLength(1);
  });
  it("reporta linhas sem identificação suficiente", () => {
    const result = validateLeadBatch(batch([{ rating: 4.9 }]));
    expect(result.errors).toHaveLength(1);
  });
});

describe("ordenação", () => {
  it("ordena por prioridade, score e avaliações", () => {
    const leads = validateLeadBatch(batch([
      { name: "Baixa", phone: "54900000001", priority: "baixa", score: 100 },
      { name: "Alta menor", phone: "54900000002", priority: "alta", score: 80, review_count: 100 },
      { name: "Alta maior", phone: "54900000003", priority: "alta", score: 90, review_count: 2 },
    ])).newLeads;
    expect(orderLeads(leads).map((lead) => lead.name)).toEqual(["Alta maior", "Alta menor", "Baixa"]);
  });
  it("mantém novos antes de abordados e dos demais status", () => {
    const leads = validateLeadBatch(batch([
      { name: "Fechado", phone: "54900000011", priority: "alta", status: "fechado", score: 100 },
      { name: "Abordado", phone: "54900000012", priority: "alta", status: "abordado", score: 100 },
      { name: "Novo", phone: "54900000013", priority: "baixa", status: "novo", score: 1 },
    ])).newLeads;
    expect(orderLeads(leads).map((lead) => lead.name)).toEqual(["Novo", "Abordado", "Fechado"]);
  });
});
