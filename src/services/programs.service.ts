import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import { generatePublicCode } from "@/utils/program-public-code";
import { normalizeProgramPublicSlug } from "@/schemas/program-public-slug-schema";
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

/** Active first, then draft, then completed; within each group newest start_date first. */
const PROGRAM_STATUS_SORT: Record<ProgramStatus, number> = {
  active: 0,
  draft: 1,
  completed: 2,
};

export type ProgramSortFields = {
  status: ProgramStatus;
  start_date: string | null;
  created_at: string;
};

export function compareProgramsByStatusAndDate(
  a: ProgramSortFields,
  b: ProgramSortFields,
): number {
  const statusDiff =
    (PROGRAM_STATUS_SORT[a.status] ?? 99) - (PROGRAM_STATUS_SORT[b.status] ?? 99);
  if (statusDiff !== 0) {
    return statusDiff;
  }

  const aDate = a.start_date?.split("T")[0] ?? "";
  const bDate = b.start_date?.split("T")[0] ?? "";
  if (aDate !== bDate) {
    if (!aDate) return 1;
    if (!bDate) return -1;
    return bDate.localeCompare(aDate);
  }

  return b.created_at.localeCompare(a.created_at);
}

function sortProgramsByStatusAndDate<T extends ProgramSortFields>(
  programs: T[],
): T[] {
  return [...programs].sort(compareProgramsByStatusAndDate);
}

export type ScheduleDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface Program {
  id: string;
  name: string;
  type: ProgramType;
  year: number | null;
  batch: number | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  schedule_days: ScheduleDay[];
  registration_link: string | null;
  bootcamp_registration_link: string | null;
  wa_group_link: string | null;
  public_code: string;
  public_slug: string | null;
  price: number;
  promo_individual_price: number | null;
  promo_bareng_teman_price: number | null;
  session_count: number;
  status: ProgramStatus;
  created_at: string;
  updated_at: string;
}
export interface CreateProgramInput {
  name: string;
  type: ProgramType;
  year: number;
  batch?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  schedule_days?: ScheduleDay[];
  registration_link?: string | null;
  bootcamp_registration_link?: string | null;
  wa_group_link?: string | null;
  public_slug?: string | null;
  price: number;
  promo_individual_price?: number | null;
  promo_bareng_teman_price?: number | null;
  session_count?: number;
  status?: ProgramStatus; // default 'draft'
}

export interface UpdateProgramInput {
  name?: string;
  type?: ProgramType;
  year?: number;
  batch?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  schedule_days?: ScheduleDay[];
  registration_link?: string | null;
  bootcamp_registration_link?: string | null;
  wa_group_link?: string | null;
  public_slug?: string | null;
  price?: number;
  promo_individual_price?: number | null;
  promo_bareng_teman_price?: number | null;
  session_count?: number;
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
  const { data, error } = await supabase.from("programs").select("*");

  if (error) {
    return { data: null, error };
  }

  return { data: sortProgramsByStatusAndDate(data ?? []), error: null };
}

export async function getActivePrograms(limit = 5): Promise<{
  data: Program[] | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("status", "active")
    .order("start_date", { ascending: false, nullsFirst: false })
    .limit(limit);

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
  const to = from + limit;

  let query = supabase.from("programs").select("*", { count: "exact" });

  if (year != null) {
    query = query.eq("year", year);
  }

  const { data, error, count } = await query;

  if (error) {
    return { data: null, error };
  }

  const sorted = sortProgramsByStatusAndDate(data ?? []);

  return {
    data: {
      data: sorted.slice(from, to),
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

async function generateUniquePublicCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const publicCode = generatePublicCode();
    const { data, error } = await supabase
      .from("programs")
      .select("id")
      .eq("public_code", publicCode)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return publicCode;
    }
  }

  throw new Error("Failed to generate a unique public link code");
}

export async function createProgram(input: CreateProgramInput): Promise<{
  data: Program | null;
  error: PostgrestError | null;
}> {
  const publicCode = await generateUniquePublicCode();
  const { data, error } = await supabase
    .from("programs")
    .insert({
      ...input,
      public_code: publicCode,
      public_slug: normalizeProgramPublicSlug(input.public_slug),
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
  const payload: UpdateProgramInput = { ...input };

  if ("public_slug" in input) {
    payload.public_slug = normalizeProgramPublicSlug(input.public_slug);
  }

  const { data, error } = await supabase
    .from("programs")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
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
