/**
 * Converts Indonesian numbers with +62 or 62 prefix to local 0… format for API payloads.
 */
export function normalizeParticipantPhoneForSubmit(phone: string): string {
  const normalized = phone.trim().replace(/[\s-]/g, "");

  if (normalized.startsWith("+62")) {
    return `0${normalized.slice(3)}`;
  }

  if (normalized.startsWith("62")) {
    return `0${normalized.slice(2)}`;
  }

  return normalized;
}
