import type { BulkSenderExportSnapshot } from "@/types/bulk-sender";
import { BULK_SENDER_PROFILE } from "./profile";

export async function buildBulkSenderWorkbook(snapshot: Pick<BulkSenderExportSnapshot, "rows">): Promise<ArrayBuffer> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Striker Sales";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(BULK_SENDER_PROFILE.sheetName);
  sheet.columns = [
    { header: BULK_SENDER_PROFILE.columns[0], key: "phone", width: 47, style: { numFmt: "@" } },
    { header: BULK_SENDER_PROFILE.columns[1], key: "firstName", width: 18, style: { numFmt: "@" } },
    { header: BULK_SENDER_PROFILE.columns[2], key: "lastName", width: 18, style: { numFmt: "@" } },
    { header: BULK_SENDER_PROFILE.columns[3], key: "message", width: 30, style: { numFmt: "@", alignment: { wrapText: true, vertical: "top" } } },
  ];
  sheet.getRow(1).font = { bold: true };
  for (const row of snapshot.rows) {
    const created = sheet.addRow({
      phone: row.normalizedPhone.startsWith("+") ? row.normalizedPhone : `+${row.normalizedPhone}`,
      firstName: row.leadName,
      lastName: "",
      message: row.message,
    });
    for (let column = 1; column <= 4; column += 1) created.getCell(column).numFmt = "@";
  }
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  const output = await workbook.xlsx.writeBuffer();
  const bytes = new Uint8Array(output as unknown as ArrayLike<number>);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function bulkSenderFileName(campaign: string | undefined, date = new Date()): string {
  const slug = (campaign || "lote").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "lote";
  return `striker-bulk-sender-${slug}-${date.toISOString().slice(0, 10)}.xlsx`;
}

export function downloadWorkbook(buffer: ArrayBuffer, filename: string) {
  const url = URL.createObjectURL(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
