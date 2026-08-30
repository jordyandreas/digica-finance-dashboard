const WORDS_PER_MINUTE = 200;

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text: string): number {
  if (!text.trim()) {
    return 0;
  }
  return text.trim().split(/\s+/).length;
}

export function computeReadTimeMinutes(bodyHtml: string): number {
  const words = countWords(stripHtmlToText(bodyHtml));
  if (words === 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatReadTimeDisplay(minutes: number): string {
  return `${minutes} min read`;
}
