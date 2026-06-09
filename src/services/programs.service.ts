import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import {
  buildPaginationMeta,
  type PaginatedResponse,
  type PaginationParams,
} from "@/types/pagination";

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
  year: number | null;
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
  year: number;
  start_date?: string | null;
  end_date?: string | null;
  price: number;
  status?: ProgramStatus; // default 'draft'
}

export interface UpdateProgramInput {
  name?: string;
  type?: ProgramType;
  year?: number;
  start_date?: string | null;
  end_date?: string | null;
  price?: number;
  status?: ProgramStatus;
}


export async function getProgramYears(): Promise<{
  data: number[];
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("programs")
    .select("year")
    .not("year", "is", null)
    .order("year", { ascending: false });

  if (error) {
    return { data: [], error };
  }

  const years = [
    ...new Set(
      (data ?? [])
        .map((row) => row.year)
        .filter((year): year is number => typeof year === "number"),
    ),
  ];

  return { data: years, error: null };
}

export async function getProgramIdsByYear(year: number): Promise<{
  data: string[];
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("programs")
    .select("id")
    .eq("year", year);

  if (error) {
    return { data: [], error };
  }

  return { data: (data ?? []).map((program) => program.id), error: null };
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

export interface ProgramsListParams extends PaginationParams {
  year?: number;
}

export async function getProgramsPaginated({
  page = 1,
  limit = 10,
  year,
}: ProgramsListParams = {}): Promise<{
  data: PaginatedResponse<Program> | null;
  error: PostgrestError | null;
}> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("programs")
    .select("*", { count: "exact" })
    .order("status", { ascending: true });

  if (year != null) {
    query = query.eq("year", year);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return { data: null, error };
  }

  return {
    data: {
      data: data ?? [],
      pagination: buildPaginationMeta(count ?? 0, page, limit),
    },
    error: null,
  };
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
