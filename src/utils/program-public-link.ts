import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const PUBLIC_CODE_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const PUBLIC_CODE_LENGTH = 6;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ProgramPublicLinkFields {
  public_code: string;
  public_slug?: string | null;
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.trim());
}

export function generatePublicCode(length = PUBLIC_CODE_LENGTH): string {
  const bytes = randomBytes(length);
  let code = "";

  for (let index = 0; index < length; index += 1) {
    code += PUBLIC_CODE_ALPHABET[bytes[index] % PUBLIC_CODE_ALPHABET.length];
  }

  return code;
}

export function resolvePublicAppOrigin(browserOrigin = ""): string {
  const configured = process.env.NEXT_PUBLIC_PUBLIC_APP_URL?.trim().replace(
    /\/$/,
    "",
  );
  if (configured) {
    return configured;
  }

  return browserOrigin.replace(/\/$/, "");
}

export function resolvePublicIdentifier(
  program: ProgramPublicLinkFields,
): string {
  const slug = program.public_slug?.trim();
  if (slug) {
    return slug;
  }

  return program.public_code.trim();
}

export function buildRegistrationUrl(
  origin: string,
  program: ProgramPublicLinkFields,
): string {
  const identifier = resolvePublicIdentifier(program);
  return `${origin.replace(/\/$/, "")}/r/${identifier}`;
}

export function buildCheckInUrl(
  origin: string,
  program: ProgramPublicLinkFields,
): string {
  const identifier = resolvePublicIdentifier(program);
  return `${origin.replace(/\/$/, "")}/c/${identifier}`;
}

export async function resolveProgramIdByIdentifier(
  supabase: SupabaseClient,
  identifier: string,
): Promise<string | null> {
  const normalized = identifier.trim();
  if (!normalized) {
    return null;
  }

  if (isUuid(normalized)) {
    const { data, error } = await supabase
      .from("programs")
      .select("id")
      .eq("id", normalized)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.id ?? null;
  }

  const { data: bySlug, error: slugError } = await supabase
    .from("programs")
    .select("id")
    .eq("public_slug", normalized)
    .maybeSingle();

  if (slugError) {
    throw slugError;
  }

  if (bySlug?.id) {
    return bySlug.id;
  }

  const { data: byCode, error: codeError } = await supabase
    .from("programs")
    .select("id")
    .eq("public_code", normalized)
    .maybeSingle();

  if (codeError) {
    throw codeError;
  }

  return byCode?.id ?? null;
}
