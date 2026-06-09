export function sanitizeSearchTerm(term: string): string {
  return term.trim().replace(/[%_,]/g, "");
}

export function toIlikePattern(term: string): string {
  const sanitized = sanitizeSearchTerm(term);
  return sanitized ? `%${sanitized}%` : "";
}

export function toOrIlikeFilter(columns: string[], term: string): string {
  const pattern = toIlikePattern(term);
  if (!pattern) {
    return "";
  }

  const quotedPattern = `"${pattern}"`;
  return columns.map((column) => `${column}.ilike.${quotedPattern}`).join(",");
}
