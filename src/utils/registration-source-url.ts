import type { RegistrationSource } from "@/constants/registration-offers";

/** Append or replace `source` query param on an absolute or relative URL. */
export function appendRegistrationSource(
  url: string,
  source: RegistrationSource,
): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const hasOrigin = /^https?:\/\//i.test(trimmed);
    const parsed = hasOrigin
      ? new URL(trimmed)
      : new URL(trimmed, "https://placeholder.local");

    parsed.searchParams.set("source", source);

    if (hasOrigin) {
      return parsed.toString();
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    const separator = trimmed.includes("?") ? "&" : "?";
    return `${trimmed}${separator}source=${encodeURIComponent(source)}`;
  }
}
