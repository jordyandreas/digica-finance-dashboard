import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

export type ProgramType =
  | "mini_bootcamp"
  | "bootcamp"
  | "workshop";

export type ProgramStatus =
  | "draft"
  | "active"
  | "completed";

export interface Program {
  id: string;
  name: string;
  type: ProgramType;
  start_date: string | null;
  end_date: string | null;
  price: number;
  status: ProgramStatus;
  created_at: string;
  updated_at: string;
}
export interface CreateProgramInput {
  name: string;
  type: ProgramType;
  start_date?: string | null;
  end_date?: string | null;
  price: number;
  status?: ProgramStatus; // default 'draft'
}

export interface UpdateProgramInput {
  name?: string;
  type?: ProgramType;
  start_date?: string | null;
  end_date?: string | null;
  price?: number;
  status?: ProgramStatus;
}


export async function getPrograms(): Promise<{
  data: Program[] | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("status", { ascending: true });

  return { data, error };
}

export async function getProgramById(id: string): Promise<{
  data: Program | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

export async function createProgram(input: CreateProgramInput): Promise<{
  data: Program | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("programs")
    .insert({
      ...input,
      status: input.status ?? "draft",
    })
    .select()
    .single();

  return { data, error };
}

export async function updateProgram(
  id: string,
  input: UpdateProgramInput
): Promise<{
  data: Program | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("programs")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function deleteProgram(id: string): Promise<{
  error: PostgrestError | null;
}> {
  const { error } = await supabase.from("programs").delete().eq("id", id);

  return { error };
}
