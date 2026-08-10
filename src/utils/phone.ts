import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export const DEFAULT_PHONE_COUNTRY: CountryCode = "ID";

export type ParsedPhoneForInput = {
  e164: string;
  country: CountryCode;
};

function stripPhoneSeparators(value: string): string {
  return value.trim().replace(/[\s-]/g, "");
}

/**
 * Parse a phone into E.164. Bare / 0… / 62… numbers default to `defaultCountry`.
 */
export function toE164Phone(
  value: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const direct = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (direct?.isValid()) {
    return direct.format("E.164");
  }

  const compact = stripPhoneSeparators(trimmed);

  if (compact.startsWith("+")) {
    const international = parsePhoneNumberFromString(compact);
    if (international?.isValid()) {
      return international.format("E.164");
    }
    return null;
  }

  if (/^62\d+/.test(compact)) {
    const withPlus = parsePhoneNumberFromString(`+${compact}`);
    if (withPlus?.isValid()) {
      return withPlus.format("E.164");
    }
  }

  const national = parsePhoneNumberFromString(compact, defaultCountry);
  if (national?.isValid()) {
    return national.format("E.164");
  }

  return null;
}

export function isValidParticipantPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (isValidPhoneNumber(trimmed)) {
    return true;
  }

  return toE164Phone(trimmed) !== null;
}

/**
 * Soft-parse stored / legacy values for form prefills.
 */
export function parsePhoneForInput(
  raw: string | null | undefined,
): ParsedPhoneForInput | null {
  if (!raw?.trim()) {
    return null;
  }

  const e164 = toE164Phone(raw);
  if (!e164) {
    return null;
  }

  const parsed = parsePhoneNumberFromString(e164);
  if (!parsed?.isValid()) {
    return null;
  }

  return {
    e164,
    country: parsed.country ?? DEFAULT_PHONE_COUNTRY,
  };
}

/**
 * Normalize phones for API / DB writes. Always returns E.164 when valid.
 */
export function normalizeParticipantPhoneForSubmit(phone: string): string {
  const e164 = toE164Phone(phone);
  if (!e164) {
    throw new Error("Invalid phone number");
  }
  return e164;
}
