export function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A"

  return new Date(dateString)
    .toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
}
