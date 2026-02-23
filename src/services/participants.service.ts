import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

export interface Participant {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  occupation: string | null;
  organization: string | null;
  program_id: string | null;
  program_name: string | null;
  status: string | null;
  payment_status: string | null;
  joined_date: string | null;
  created_at: string | null;
}

export interface CreateParticipantInput {
  name: string;
  email?: string;
  phone?: string;
  occupation?: string;
  organization?: string;
  program_id: string;
  program_name?: string;
  status?: string;
  // payment_status?: string;
  joined_date?: string;
}

export interface UpdateParticipantInput {
  name?: string;
  email?: string;
  phone?: string;
  occupation?: string;
  organization?: string;
  program_id?: string;
  program_name?: string;
  status?: string;
  // payment_status?: string;
  joined_date?: string;
}

export async function getParticipants(programId?: string): Promise<{
  data: Participant[] | null;
  error: PostgrestError | null;
}> {
  let query = supabase
    .from("participants")
    .select("*")
    .order("created_at", { ascending: true });

  if (programId) {
    query = query.eq("program_id", programId);
  }

  const { data, error } = await query;

  return { data, error };
}

export async function createParticipant(
  input: CreateParticipantInput,
): Promise<{
  data: Participant | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("participants")
    .insert([input])
    .select()
    .single();

  return { data, error };
}

export async function updateParticipant(
  id: string,
  input: UpdateParticipantInput,
): Promise<{
  data: Participant | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("participants")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function deleteParticipant(id: string): Promise<{
  error: PostgrestError | null;
}> {
  const { error } = await supabase.from("participants").delete().eq("id", id);

  return { error };
}