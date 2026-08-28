import type {
  ProgramType,
  ScheduleDay,
} from "@/services/programs.service";
import { format } from "date-fns";
import { parseDateString } from "@/lib/date-utils";

const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  mini_bootcamp: "mini bootcamp",
  bootcamp: "bootcamp",
  workshop: "workshop",
};

export const SCHEDULE_DAY_OPTIONS: {
  value: ScheduleDay;
  label: string;
}[] = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const SCHEDULE_DAY_ORDER: ScheduleDay[] = SCHEDULE_DAY_OPTIONS.map(
  (option) => option.value,
);

const SCHEDULE_DAY_LABELS: Record<ScheduleDay, string> = Object.fromEntries(
  SCHEDULE_DAY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ScheduleDay, string>;

export function normalizeScheduleDays(
  days?: ScheduleDay[] | null,
): ScheduleDay[] {
  if (!days?.length) {
    return [];
  }

  const unique = new Set(days);
  return SCHEDULE_DAY_ORDER.filter((day) => unique.has(day));
}

export function formatScheduleDays(
  days?: ScheduleDay[] | null,
): string | null {
  const ordered = normalizeScheduleDays(days);
  if (ordered.length === 0) {
    return null;
  }

  const labels = ordered.map((day) => SCHEDULE_DAY_LABELS[day]);

  if (labels.length === 1) {
    return `Every ${labels[0]}`;
  }

  if (labels.length === 2) {
    return `Every ${labels[0]} & ${labels[1]}`;
  }

  const head = labels.slice(0, -1).join(", ");
  const last = labels[labels.length - 1];
  return `Every ${head} & ${last}`;
}

export function formatProgramType(type?: ProgramType | null): string {
  if (!type) return "-";

  return PROGRAM_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

export function isBootcampProgram(type?: ProgramType | null): boolean {
  return type === "bootcamp" || type === "mini_bootcamp";
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
