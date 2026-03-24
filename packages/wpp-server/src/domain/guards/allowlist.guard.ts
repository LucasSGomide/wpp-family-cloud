export function normalizeJid(jid: string): string {
  return jid
    .replace('@s.whatsapp.net', '')
    .replace(/\D/g, '');
}

export function isAllowed(from: string, allowedNumber: string): boolean {
  if (!allowedNumber) return false;
  return normalizeJid(from) === normalizeJid(allowedNumber);
}
