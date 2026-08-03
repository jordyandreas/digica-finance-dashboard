import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getTodayDateString } from "@/lib/date-utils";
import type { ProgramType } from "@/services/programs.service";
import type { CheckInTodayProgram } from "@/types/check-in-today";

export type { CheckInTodayProgram };

interface ProgramJoin {
  id: string;
  name: string;
  type: ProgramType;
  batch: number | null;
  status: string;
  public_code: string | null;
  public_slug: string | null;
}

interface SessionWithProgramRow {
  session_number: number;
  session_date: string;
  program: ProgramJoin | ProgramJoin[] | null;
}

function normalizeBatch(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 1) {
    return raw;
  }
  if (raw == null) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : null;
}

function unwrapProgram(
  program: SessionWithProgramRow["program"],
): ProgramJoin | null {
  if (!program) {
    return null;
  }
  return Array.isArray(program) ? (program[0] ?? null) : program;
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const today = getTodayDateString();

    const { data, error } = await supabase
      .from("program_sessions")
      .select(
        `
        session_number,
        session_date,
        program:programs!inner (
          id,
          name,
          type,
          batch,
          status,
          public_code,
          public_slug
        )
      `,
      )
      .eq("session_date", today)
      .order("session_number", { ascending: true });

    if (error) {
      throw error;
    }

    const programsById = new Map<string, CheckInTodayProgram>();

    for (const row of (data ?? []) as SessionWithProgramRow[]) {
      const program = unwrapProgram(row.program);
      if (!program) {
        continue;
      }

      const publicCode = program.public_code?.trim();
      if (!publicCode) {
        continue;
      }

      if (program.status !== "active") {
        continue;
      }

      if (programsById.has(program.id)) {
        continue;
      }

      programsById.set(program.id, {
        id: program.id,
        name: program.name,
        type: program.type,
        batch: normalizeBatch(program.batch),
        public_code: publicCode,
        public_slug: program.public_slug?.trim() || null,
        session_number: row.session_number,
      });
    }

    const programs = [...programsById.values()].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

    return NextResponse.json({ programs });
  } catch (error) {
    console.error("Error loading today's check-in programs:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load today's programs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
