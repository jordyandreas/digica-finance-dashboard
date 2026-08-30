import { format, isValid, parse } from "date-fns";
import {
  formatDateLabel,
  parseDateString,
  toDateString,
} from "@/lib/date-utils";

export function formatArticleDisplayDate(
  publishedAt: string | Date | null | undefined,
): string {
  if (!publishedAt) {
    return "";
  }

  const date =
    publishedAt instanceof Date ? publishedAt : new Date(publishedAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Map stored display_date or published_at to YYYY-MM-DD for date picker. */
export function articleDisplayDateToFormValue(
  displayDate: string | null | undefined,
  publishedAt?: string | null,
): string {
  if (displayDate?.trim()) {
    const longParsed = parse(displayDate.trim(), "MMMM d, yyyy", new Date());
    if (isValid(longParsed)) {
      return toDateString(longParsed);
    }

    const storageParsed = parseDateString(displayDate);
    if (storageParsed) {
      return toDateString(storageParsed);
    }
  }

  if (publishedAt) {
    const publishedParsed = parseDateString(publishedAt);
    if (publishedParsed) {
      return toDateString(publishedParsed);
    }
  }

  return "";
}

/** Map YYYY-MM-DD form value to long display string for DB display_date. */
export function formDisplayDateToStorage(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return formatDateLabel(trimmed);
}

/** Format article display metadata for editor header. */
export function formatArticleMetaDate(
  displayDate: string | null | undefined,
  publishedAt: string | null | undefined,
): string {
  if (displayDate?.trim()) {
    return displayDate.trim();
  }

  return formatArticleDisplayDate(publishedAt);
}

export function formatStorageDateLabel(value: string): string {
  const parsed = parseDateString(value);
  if (!parsed) {
    return value;
  }

  return format(parsed, "MMMM d, yyyy");
}
