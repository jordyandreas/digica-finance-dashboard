import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

export interface ProgramPublicContent {
  id: string;
  program_id: string;
  summary_html: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UpsertProgramPublicContentInput {
  program_id: string;
  summary_html?: string | null;
}

export async function getProgramPublicContent(programId: string): Promise<{
  data: ProgramPublicContent | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("program_public_contents")
    .select("*")
    .eq("program_id", programId)
    .maybeSingle();

  return { data, error };
}

export async function upsertProgramPublicContent(
  input: UpsertProgramPublicContentInput,
): Promise<{
  data: ProgramPublicContent | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("program_public_contents")
    .upsert(input, { onConflict: "program_id" })
    .select()
    .single();

  return { data, error };
}
