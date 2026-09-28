export const BULK_SENDER_PROFILE = {
  profileId: "waplus-sender-template" as const,
  profileVersion: "1.0" as const,
  profileValidated: true as const,
  sheetName: "Sheet1" as const,
  columns: ["WhatsApp Number(with country code)", "First Name", "Last Name", "Other"] as const,
};

export const BULK_SENDER_PROFILE_NOTICE = "Formato oficial WAPlus Sender: número com +55 na primeira coluna e abordagem completa no campo ‘Other’.";
