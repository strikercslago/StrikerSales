import { normalizePhone, phoneFromWhatsAppUrl } from "./normalize-phone";

export function getWhatsAppPhone(phone?: string, whatsappUrl?: string) {
  return normalizePhone(phone) ?? phoneFromWhatsAppUrl(whatsappUrl);
}

export function buildWhatsAppUrl(phone: string, message: string): string | undefined {
  const normalized = normalizePhone(phone);
  if (!normalized) return undefined;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
