import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import type { AttendanceStatus } from "@/constants/attendance-status";
import type { ProgramSession } from "@/services/program-sessions.service";

export interface AttendanceRecord {
  id: string;
  participant_id: string;
  session_id: string;
  status: AttendanceStatus;
  created_at: string;
  updated_at: string;
}

export interface AttendanceUpsertInput {
  participant_id: string;
  session_id: string;
  status: AttendanceStatus;
}

export type AttendanceGrid = Record<
  string,
  Record<string, AttendanceStatus>
>;

export async function getAttendanceByProgram(programId: string): Promise<{
  data: AttendanceGrid;
  error: PostgrestError | null;
}> {
  const { data: sessions, error: sessionsError } = await supabase
    .from("program_sessions")
    .select("id")
    .eq("program_id", programId);

  if (sessionsError) {
    return { data: {}, error: sessionsError };
  }

  const sessionIds = (sessions ?? []).map((session) => session.id);

  if (sessionIds.length === 0) {
    return { data: {}, error: null };
  }

  const { data, error } = await supabase
    .from("attendance")
    .select("participant_id, session_id, status")
    .in("session_id", sessionIds);

  if (error) {
    return { data: {}, error };
  }

  const grid: AttendanceGrid = {};

  for (const row of data ?? []) {
    if (!grid[row.participant_id]) {
      grid[row.participant_id] = {};
    }
    grid[row.participant_id][row.session_id] = row.status as AttendanceStatus;
  }

  return { data: grid, error: null };
}

export async function deleteAttendance(
  participantId: string,
  sessionId: string,
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("participant_id", participantId)
    .eq("session_id", sessionId);

  return { error };
}

export async function upsertAttendance(
  records: AttendanceUpsertInput[],
): Promise<{ error: PostgrestError | null }> {
  if (records.length === 0) {
    return { error: null };
  }

  const { error } = await supabase.from("attendance").upsert(
    records.map((record) => ({
      participant_id: record.participant_id,
      session_id: record.session_id,
      status: record.status,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "participant_id,session_id" },
  );

  return { error };
}

export function buildSessionHeaders(sessions: ProgramSession[]) {
  return sessions.map((session) => ({
    id: session.id,
    sessionNumber: session.session_number,
    sessionDate: session.session_date,
  }));
}
