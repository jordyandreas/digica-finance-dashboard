import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
  type PhoneNumber,
} from "libphonenumber-js";

export const DEFAULT_PHONE_COUNTRY: CountryCode = "ID";

/** E.164 maximum: country code + national number (digits only, no `+`). */
export const MAX_PHONE_DIGITS = 15;

export const PHONE_MAX_DIGITS_ERROR =
  "Phone number must not exceed 15 digits (including country code)";

export const PHONE_MAX_DIGITS_ERROR_TYPE = "maxDigits";

export type ParsedPhoneForInput = {
  e164: string;
  country: CountryCode;
};

function stripPhoneSeparators(value: string): string {
  return value.trim().replace(/[\s-]/g, "");
}

export function countPhoneDigits(value: string): number {
  return value.replace(/\D/g, "").length;
}

export function isWithinMaxPhoneDigits(value: string): boolean {
  return countPhoneDigits(value) <= MAX_PHONE_DIGITS;
}

function parseStoredPhone(
  value: string,
  defaultCountry: CountryCode,
): PhoneNumber | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const direct = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (direct) {
    return direct;
  }

  const compact = stripPhoneSeparators(trimmed);

  if (compact.startsWith("+")) {
    return parsePhoneNumberFromString(compact) ?? undefined;
  }

  if (/^62\d+/.test(compact)) {
    const withPlus = parsePhoneNumberFromString(`+${compact}`);
    if (withPlus) {
      return withPlus;
    }
  }

  return parsePhoneNumberFromString(compact, defaultCountry) ?? undefined;
}

/**
 * Parse a phone into E.164. Bare / 0… / 62… numbers default to `defaultCountry`.
 */
export function toE164Phone(
  value: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): string | null {
  const parsed = parseStoredPhone(value, defaultCountry);
  if (!parsed?.isValid()) {
    return null;
  }

  const e164 = parsed.format("E.164");
  if (!isWithinMaxPhoneDigits(e164)) {
    return null;
  }

  return e164;
}

/**
 * Coerce stored / typed values into E.164 for phone inputs.
 * Accepts possible numbers (including slightly over-length legacy values)
 * so `react-phone-number-input` never receives a national `08…` string.
 */
export function toE164PhoneForInput(
  value: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): string | undefined {
  const parsed = parseStoredPhone(value, defaultCountry);
  if (!parsed) {
    return undefined;
  }

  const e164 = parsed.format("E.164");
  if (!isWithinMaxPhoneDigits(e164)) {
    return undefined;
  }

  return e164;
}

export function isValidParticipantPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (!isWithinMaxPhoneDigits(trimmed)) {
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

  const e164 = toE164PhoneForInput(raw);
  if (!e164) {
    return null;
  }

  const parsed = parsePhoneNumberFromString(e164);
  if (!parsed) {
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
