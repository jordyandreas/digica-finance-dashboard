import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import { PAYMENT_STATUS_ALL } from "@/constants/payment-status";
import {
  buildPaginationMeta,
  type ListParams,
  type PaginatedResponse,
} from "@/types/pagination";
import { toOrIlikeFilter } from "@/utils/search";

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
  notes: string | null;
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
  payment_status?: string;
  joined_date?: string;
  notes?: string;
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
  payment_status?: string;
  joined_date?: string;
  notes?: string;
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

export async function getParticipantsPaginated(
  programId: string,
  { page = 1, limit = 10, search, status }: ListParams = {},
): Promise<{
  data: PaginatedResponse<Participant> | null;
  error: PostgrestError | null;
}> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const searchFilter = search
    ? toOrIlikeFilter(["name", "email", "phone"], search)
    : "";

  let query = supabase
    .from("participants")
    .select("*", { count: "exact" })
    .eq("program_id", programId);

  if (searchFilter) {
    query = query.or(searchFilter);
  }

  if (status && status !== PAYMENT_STATUS_ALL) {
    query = query.eq("payment_status", status);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: true })
    .range(from, to);

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