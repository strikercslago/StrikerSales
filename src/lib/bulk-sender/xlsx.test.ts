import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { buildBulkSenderWorkbook } from "./xlsx";

describe("XLSX do Bulk Sender", () => {
  it("grava telefones e mensagens completas como texto", async () => {
    const messages = ["Olá, José! 👋\nTudo bem?", "=HIPERLINK(\"https://example.com\")", "+5511999999999", "-10", "@contato"];
    const rows = messages.map((message, index) => ({ leadId: `lead-${index}`, leadName: `Empresa ${index}`, originalPhone: "(54) 99999-0000", normalizedPhone: `555499999000${index}`, message }));
    const buffer = await buildBulkSenderWorkbook({ rows });
    const workbook = new ExcelJS.Workbook(); const input = Buffer.from(buffer) as unknown as Parameters<typeof workbook.xlsx.load>[0]; await workbook.xlsx.load(input);
    const officialSheet = workbook.getWorksheet("Sheet1")!;
    expect(officialSheet.getRow(1).values).toEqual([, "WhatsApp Number(with country code)", "First Name", "Last Name", "Other"]);
    messages.forEach((message, index) => {
      expect(officialSheet.getCell(index + 2, 1).value).toBe(`+${rows[index].normalizedPhone}`);
      expect(typeof officialSheet.getCell(index + 2, 1).value).toBe("string");
      expect(officialSheet.getCell(index + 2, 2).value).toBe(rows[index].leadName);
      expect(officialSheet.getCell(index + 2, 3).value).toBe("");
      expect(officialSheet.getCell(index + 2, 4).value).toBe(message);
      expect(typeof officialSheet.getCell(index + 2, 4).value).toBe("string");
    });
  });
});
