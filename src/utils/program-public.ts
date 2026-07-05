import { format } from "date-fns";
import { parseDateString } from "@/lib/date-utils";
import {
  buildRegistrationUrl,
  type ProgramPublicLinkFields,
} from "@/utils/program-public-link";

function formatProgramDate(value: string | null): string {
  const parsed = parseDateString(value);
  if (!parsed) {
    return "";
  }

  return format(parsed, "EEE, dd MMMM yyyy");
}

function formatProgramTime(value: string | null): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.slice(0, 5).replace(":", ".");
}

export function formatProgramDateRange(
  startDate: string | null,
  endDate: string | null,
): string {
  const startLabel = formatProgramDate(startDate);
  const endLabel = formatProgramDate(endDate);

  if (startLabel && endLabel) {
    return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
  }

  return startLabel || endLabel || "Date to be announced";
}

export function formatProgramTimeRange(
  startTime: string | null,
  endTime: string | null,
): string {
  const startLabel = formatProgramTime(startTime);
  const endLabel = formatProgramTime(endTime);

  if (startLabel && endLabel) {
    return `${startLabel} - ${endLabel} WIB`;
  }

  if (startLabel || endLabel) {
    return `${startLabel || endLabel} WIB`;
  }

  return "Time to be announced";
}

export function resolveRegistrationLink(
  registrationLink: string | null | undefined,
  origin = "",
  program?: ProgramPublicLinkFields | null,
): string {
  const custom = registrationLink?.trim();
  if (custom) {
    return custom;
  }

  if (!origin || !program?.public_code) {
    return "";
  }

  return buildRegistrationUrl(origin, program);
}
