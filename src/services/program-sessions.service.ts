import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

export interface ProgramSession {
  id: string;
  program_id: string;
  session_number: number;
  session_date: string | null;
  created_at: string;
}

export interface ProgramSessionDateUpdate {
  session_number: number;
  session_date: string | null;
}

export async function getProgramSessions(programId: string): Promise<{
  data: ProgramSession[];
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("program_sessions")
    .select("*")
    .eq("program_id", programId)
    .order("session_number", { ascending: true });

  return { data: data ?? [], error };
}

export async function updateProgramSessionDates(
  programId: string,
  updates: ProgramSessionDateUpdate[],
): Promise<{ error: PostgrestError | null }> {
  for (const update of updates) {
    const { error } = await supabase
      .from("program_sessions")
      .update({ session_date: update.session_date })
      .eq("program_id", programId)
      .eq("session_number", update.session_number);

    if (error) {
      return { error };
    }
  }

  return { error: null };
}

export async function syncProgramSessions(
  programId: string,
  sessionCount: number,
): Promise<{ error: PostgrestError | null }> {
  const { data: existing, error: fetchError } = await getProgramSessions(
    programId,
  );

  if (fetchError) {
    return { error: fetchError };
  }

  const existingNumbers = new Set(
    (existing ?? []).map((session) => session.session_number),
  );

  const toInsert = [];
  for (let n = 1; n <= sessionCount; n += 1) {
    if (!existingNumbers.has(n)) {
      toInsert.push({
        program_id: programId,
        session_number: n,
      });
    }
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("program_sessions")
      .insert(toInsert);

    if (insertError) {
      return { error: insertError };
    }
  }

  if (sessionCount < (existing ?? []).length) {
    const { error: deleteError } = await supabase
      .from("program_sessions")
      .delete()
      .eq("program_id", programId)
      .gt("session_number", sessionCount);

    if (deleteError) {
      return { error: deleteError };
    }
  }

  return { error: null };
}
