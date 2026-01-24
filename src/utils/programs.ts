import type { ProgramType } from "@/services/programs.service";

const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  mini_bootcamp: "mini bootcamp",
  bootcamp: "bootcamp",
  workshop: "workshop",
};

export function formatProgramType(type?: ProgramType | null): string {
  if (!type) return "-";

  return PROGRAM_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}
