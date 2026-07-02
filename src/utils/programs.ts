import type { ProgramType } from "@/services/programs.service";
import { format } from "date-fns";
import { parseDateString } from "@/lib/date-utils";

const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  mini_bootcamp: "mini bootcamp",
  bootcamp: "bootcamp",
  workshop: "workshop",
};

export function formatProgramType(type?: ProgramType | null): string {
  if (!type) return "-";

  return PROGRAM_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

function formatShortProgramDate(value?: string | null): string {
  const parsed = parseDateString(value);
  if (!parsed) {
    return "";
  }

  return format(parsed, "dd/MM/yyyy");
}

function formatShortProgramTime(value?: string | null): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.slice(0, 5).replace(":", ".");
}

export function formatProgramShortDateRange(
  startDate?: string | null,
  endDate?: string | null,
): string {
  const startLabel = formatShortProgramDate(startDate);
  const endLabel = formatShortProgramDate(endDate);

  if (startLabel && endLabel) {
    return `${startLabel} - ${endLabel}`;
  }

  return startLabel || endLabel || "—";
}

export function formatProgramShortTimeRange(
  startTime?: string | null,
  endTime?: string | null,
): string {
  const startLabel = formatShortProgramTime(startTime);
  const endLabel = formatShortProgramTime(endTime);

  if (startLabel && endLabel) {
    return `${startLabel} - ${endLabel}`;
  }

  if (startLabel || endLabel) {
    return startLabel || endLabel;
  }

  return "—";
}
