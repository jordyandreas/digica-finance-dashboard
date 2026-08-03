import type { ProgramType } from "@/services/programs.service";

export interface CheckInTodayProgram {
  id: string;
  name: string;
  type: ProgramType;
  batch: number | null;
  public_code: string;
  public_slug: string | null;
  session_number: number;
}
