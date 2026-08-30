const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "h2",
    "h3",
    "strong",
    "em",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
    "br",
  ],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

/**
 * Sanitize article HTML in the browser (admin UI).
 * Uses dompurify directly to avoid isomorphic-dompurify/jsdom ESM issues in Next.js.
 */
export async function sanitizeArticleHtml(html: string): Promise<string> {
  const { default: DOMPurify } = await import("dompurify");
  return DOMPurify.sanitize(html, SANITIZE_CONFIG).trim();
}
