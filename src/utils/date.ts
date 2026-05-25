import { toDateString } from "@/lib/date-utils";

/** YYYY-MM-DD in local timezone for form date fields */
export function getLocalDateInputValue(date: Date = new Date()): string {
  return toDateString(date);
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A"

  return new Date(dateString)
    .toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
}
