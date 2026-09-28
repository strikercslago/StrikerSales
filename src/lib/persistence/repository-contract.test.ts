import { beforeEach, describe, expect, it } from "vitest";
import { LocalLeadRepository } from "./local-lead-repository";

class MemoryStorage implements Storage {
  private data = new Map<string, string>(); get length() { return this.data.size; }
  clear() { this.data.clear(); } getItem(key: string) { return this.data.get(key) ?? null; }
  key(index: number) { return [...this.data.keys()][index] ?? null; } removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, value); }
}

describe("contrato LeadRepository", () => {
  beforeEach(() => Object.defineProperty(globalThis, "localStorage", { value: new MemoryStorage(), configurable: true }));
  it("cria, edita e persiste um lead", async () => {
    const repo = new LocalLeadRepository(); const created = await repo.createLead({ name: "Novo", phone: "54999991234", message: "Oi" });
    const edited = await repo.updateLead(created.id, { businessName: "Empresa", city: "Passo Fundo" });
    expect(edited.businessName).toBe("Empresa"); expect((await new LocalLeadRepository().getLeadById(created.id))?.city).toBe("Passo Fundo");
    expect(edited.history.map((event) => event.type)).toContain("lead_updated");
  });
  it("faz soft delete, restaura e exclui permanentemente", async () => {
    const repo = new LocalLeadRepository(); const lead = await repo.createLead({ name: "Excluir", city: "Passo Fundo" });
    await repo.softDeleteLead(lead.id); expect(await repo.getLeads("active")).toHaveLength(0); expect((await repo.getLeads("deleted"))[0].history.at(-1)?.type).toBe("lead_deleted");
    await repo.restoreLead(lead.id); expect(await repo.getLeads("active")).toHaveLength(1); expect((await repo.getLeadById(lead.id))?.history.at(-1)?.type).toBe("lead_restored");
    await repo.permanentlyDeleteLead(lead.id); expect(await repo.getLeads("all")).toHaveLength(0);
  });
  it("registra abordagem, status e follow-up", async () => {
    const repo = new LocalLeadRepository(); const lead = await repo.createLead({ name: "Fluxo", phone: "54999991234" });
    const approached = await repo.markApproached(lead.id, "Mensagem usada"); expect(approached.status).toBe("abordado"); expect(approached.approachedAt).toBeTruthy(); expect(approached.history.slice(-2).map((item) => item.type)).toEqual(["whatsapp_opened", "approach_sent"]);
    const reverted = await repo.revertApproach(lead.id); expect(reverted.status).toBe("novo"); expect(reverted.approachedAt).toBeUndefined(); expect(reverted.history.at(-1)?.type).toBe("approach_reverted");
    const responded = await repo.changeStatus(lead.id, "respondeu"); expect(responded.respondedAt).toBeTruthy();
    const followup = await repo.scheduleFollowup(lead.id, "2026-09-01T12:00:00.000Z"); expect(followup.followupAt).toBeTruthy(); expect(followup.history.at(-1)?.type).toBe("followup_scheduled");
    const removed = await repo.scheduleFollowup(lead.id); expect(removed.followupAt).toBeUndefined();
  });
  it("aplica revisões somente enquanto o lead continua novo e inalterado", async () => {
    const repo = new LocalLeadRepository();
    const lead = await repo.createLead({ name: "Revisão", message: "Mensagem original", followupMessage: "Follow-up original" });
    const first = await repo.applyApproachReviews([{ leadId: lead.id, expectedUpdatedAt: lead.updatedAt, message: "Mensagem revisada", followupMessage: "Follow-up revisado" }]);
    expect(first).toMatchObject({ updated: 1, skipped: 0 });
    expect(await repo.getLeadById(lead.id)).toMatchObject({ message: "Mensagem revisada", followupMessage: "Follow-up revisado" });

    const stale = await repo.applyApproachReviews([{ leadId: lead.id, expectedUpdatedAt: "2000-01-01T00:00:00.000Z", message: "Não deve substituir" }]);
    expect(stale).toMatchObject({ updated: 0, skipped: 1 });

    const current = await repo.getLeadById(lead.id);
    await repo.markApproached(lead.id, current?.message ?? "");
    const approached = await repo.applyApproachReviews([{ leadId: lead.id, expectedUpdatedAt: current?.updatedAt ?? "", message: "Também não deve substituir" }]);
    expect(approached).toMatchObject({ updated: 0, skipped: 1 });
  });
  it("persiste a meta diária", async () => {
    const repo = new LocalLeadRepository(); await repo.setDailyGoal(24); expect(await new LocalLeadRepository().getDailyGoal()).toBe(24);
  });
  it("registra o retrato do lote uma única vez sem alterar o lead", async () => {
    const repo = new LocalLeadRepository(); const lead = await repo.createLead({ name: "Bulk", phone: "54999990000", message: "Mensagem exata" });
    const record = { fingerprint: "fingerprint-1", batchName: "Lote teste", purpose: "initial" as const, profileId: "waplus-sender-template" as const, profileVersion: "1.0" as const, profileValidated: true as const, sheetName: "Sheet1" as const, columns: ["WhatsApp Number(with country code)", "First Name", "Last Name", "Other"] as const, rows: [{ leadId: lead.id, leadName: lead.name, originalPhone: lead.phone!, normalizedPhone: lead.normalizedPhone!, message: lead.message }], exclusions: [] };
    const first = await repo.saveBulkSenderExport(record); const repeated = await repo.saveBulkSenderExport(record);
    expect(first.created).toBe(true); expect(repeated.created).toBe(false); expect(repeated.snapshot.id).toBe(first.snapshot.id);
    expect(await repo.getBulkSenderExports()).toHaveLength(1);
    const unchanged = await repo.getLeadById(lead.id); expect(unchanged).toMatchObject({ status: "novo", message: "Mensagem exata" }); expect(unchanged?.approachedAt).toBeUndefined();
  });
});
