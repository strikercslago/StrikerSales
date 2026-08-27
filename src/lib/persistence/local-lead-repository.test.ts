import { beforeEach, describe, expect, it } from "vitest";
import { LocalLeadRepository } from "./local-lead-repository";
import { validateLeadBatch } from "../leads/validation";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.get(key) ?? null; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, value); }
}

describe("persistência e backup", () => {
  beforeEach(() => { Object.defineProperty(globalThis, "localStorage", { value: new MemoryStorage(), configurable: true }); });
  it("mantém os leads após nova instância do repositório", async () => {
    const leads = validateLeadBatch({ leads: [{ name: "Persistente", phone: "54999991234" }] }).newLeads;
    await new LocalLeadRepository().saveLeads(leads);
    expect((await new LocalLeadRepository().load()).leads[0].name).toBe("Persistente");
  });
  it("restaura leads, histórico, mensagens e configurações", async () => {
    const lead = validateLeadBatch({ leads: [{ name: "Backup", message: "Mensagem salva" }] }).newLeads[0];
    const snapshot = { version: 1 as const, exportedAt: new Date().toISOString(), leads: [lead], settings: { dailyGoal: { target: 27, date: new Date().toISOString().slice(0, 10) } } };
    const restored = await new LocalLeadRepository().restore(snapshot);
    expect(restored.leads[0].message).toBe("Mensagem salva");
    expect(restored.leads[0].history[0].type).toBe("lead_imported");
    expect(restored.settings.dailyGoal.target).toBe(27);
  });
});
