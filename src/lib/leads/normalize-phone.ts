export function normalizePhone(value?: string): string | undefined {
  if (!value) return undefined;
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (!digits.startsWith("55") && (digits.length === 10 || digits.length === 11)) {
    digits = `55${digits}`;
  }
  return digits.length >= 12 && digits.length <= 13 && digits.startsWith("55")
    ? digits
    : undefined;
}

export function phoneFromWhatsAppUrl(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(/(?:wa\.me\/|phone=)(\+?[\d\s().-]+)/i);
  return normalizePhone(match?.[1]);
}

export function displayPhone(value?: string): string {
  const phone = normalizePhone(value);
  if (!phone) return value ?? "—";
  const local = phone.slice(2);
  return local.length === 11
    ? `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`
    : `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
}
