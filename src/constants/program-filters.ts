import type { ProgramStatus, ProgramType } from "@/services/programs.service";
import { formatProgramType } from "@/utils/programs";

export const PROGRAM_TYPE_ALL = "all";
export const PROGRAM_STATUS_ALL = "all";

export const PROGRAM_TYPES: ProgramType[] = [
  "mini_bootcamp",
  "bootcamp",
  "workshop",
];

export const PROGRAM_STATUSES: ProgramStatus[] = [
  "draft",
  "active",
  "completed",
];

export function formatProgramStatusLabel(
  status: string | null | undefined,
): string {
  if (!status) {
    return "";
  }
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export const PROGRAM_TYPE_FILTER_OPTIONS = [
  { label: "All types", value: PROGRAM_TYPE_ALL },
  ...PROGRAM_TYPES.map((type) => ({
    label: formatProgramType(type).replace(/\b\w/g, (char) => char.toUpperCase()),
    value: type,
  })),
];

export const PROGRAM_STATUS_FILTER_OPTIONS = [
  { label: "All statuses", value: PROGRAM_STATUS_ALL },
  ...PROGRAM_STATUSES.map((status) => ({
    label: formatProgramStatusLabel(status),
    value: status,
  })),
];
