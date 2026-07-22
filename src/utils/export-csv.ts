function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export type ParticipantCsvRow = {
  name: string;
  phone: string;
  email: string;
  occupation: string;
  organization: string;
  paymentStatus: string;
};

const PARTICIPANT_CSV_HEADERS = [
  "Name",
  "Phone",
  "Email",
  "Occupation",
  "Organization",
  "Payment Status",
] as const;

/** Build a single-column CSV with header `Name` for Canva bulk create. */
export function buildAttendanceNamesCsv(names: string[]): string {
  const rows = names.map((name) => escapeCsvValue(name));
  return ["Name", ...rows].join("\n");
}

/** Build a multi-column CSV of participant info. */
export function buildParticipantsCsv(rows: ParticipantCsvRow[]): string {
  const header = PARTICIPANT_CSV_HEADERS.join(",");
  const body = rows.map((row) =>
    [
      escapeCsvValue(row.name),
      escapeCsvValue(row.phone),
      escapeCsvValue(row.email),
      escapeCsvValue(row.occupation),
      escapeCsvValue(row.organization),
      escapeCsvValue(row.paymentStatus),
    ].join(","),
  );
  return [header, ...body].join("\n");
}

export function sanitizeCsvFilename(name: string): string {
  const sanitized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return sanitized || "attendees";
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
